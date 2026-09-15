import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Caixa, StatusCaixa, ValoresPorFormaPagamento } from './caixa.entity';
import { Venda, StatusVenda } from '../vendas/venda.entity';
import { Pagamento } from '../vendas/pagamento.entity';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';

@Injectable()
export class CaixaService {
  constructor(
    @InjectRepository(Caixa) private readonly caixaRepo: Repository<Caixa>,
    @InjectRepository(Venda) private readonly vendaRepo: Repository<Venda>,
    @InjectRepository(Pagamento) private readonly pagamentoRepo: Repository<Pagamento>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  // RF08 - abre caixa registrando fundo de troco, operador e data/hora.
  async abrir(operadorId: string, dto: AbrirCaixaDto): Promise<Caixa> {
    const jaAberto = await this.buscarCaixaAbertoDoOperador(operadorId);
    if (jaAberto) {
      throw new BadRequestException('já existe um caixa aberto para este operador');
    }

    const caixa = this.caixaRepo.create({
      operadorId,
      fundoTrocoCentavos: dto.fundoTrocoCentavos,
      status: StatusCaixa.ABERTO,
    });
    await this.caixaRepo.save(caixa);

    // RNF08 - abertura de caixa é operação sensível.
    await this.auditoriaService.registrar(operadorId, AcaoAuditoria.ABERTURA_CAIXA, {
      caixaId: caixa.id,
      fundoTrocoCentavos: dto.fundoTrocoCentavos,
    });

    return caixa;
  }

  async buscarCaixaAbertoDoOperador(operadorId: string): Promise<Caixa | null> {
    return this.caixaRepo.findOne({ where: { operadorId, status: StatusCaixa.ABERTO } });
  }

  // RF09 - fecha caixa, compara contado x registrado, gera divergências.
  async fechar(caixaId: string, operadorId: string, dto: FecharCaixaDto): Promise<Caixa> {
    const caixa = await this.caixaRepo.findOne({ where: { id: caixaId } });
    if (!caixa) {
      throw new NotFoundException('caixa não encontrado');
    }
    if (caixa.status !== StatusCaixa.ABERTO) {
      throw new BadRequestException('caixa já está fechado');
    }

    const valoresContados: ValoresPorFormaPagamento = {
      dinheiro: dto.dinheiroContado,
      debito: dto.debitoContado,
      credito: dto.creditoContado,
      pix: dto.pixContado,
    };
    const valoresRegistrados = await this.calcularValoresRegistrados(caixaId);

    const divergencias: ValoresPorFormaPagamento = {
      dinheiro: valoresContados.dinheiro - valoresRegistrados.dinheiro,
      debito: valoresContados.debito - valoresRegistrados.debito,
      credito: valoresContados.credito - valoresRegistrados.credito,
      pix: valoresContados.pix - valoresRegistrados.pix,
    };

    caixa.valoresContados = valoresContados;
    caixa.valoresRegistrados = valoresRegistrados;
    caixa.divergencias = divergencias;
    caixa.status = StatusCaixa.FECHADO;
    caixa.dataFechamento = new Date();
    await this.caixaRepo.save(caixa);

    // RNF08 - fechamento de caixa é operação sensível.
    await this.auditoriaService.registrar(operadorId, AcaoAuditoria.FECHAMENTO_CAIXA, {
      caixaId: caixa.id,
      divergencias,
    });

    return caixa;
  }

  // Usado no fechamento (RF09) e reaproveitado nos relatórios (RF14).
  async calcularValoresRegistrados(caixaId: string): Promise<ValoresPorFormaPagamento> {
    const vendasFinalizadas = await this.vendaRepo.find({
      where: { caixaId, status: StatusVenda.FINALIZADA },
      select: ['id'],
    });
    const vendaIds = vendasFinalizadas.map((v) => v.id);

    const base: ValoresPorFormaPagamento = { dinheiro: 0, debito: 0, credito: 0, pix: 0 };
    if (vendaIds.length === 0) {
      return base;
    }

    const pagamentos = await this.pagamentoRepo
      .createQueryBuilder('p')
      .where('p.vendaId IN (:...vendaIds)', { vendaIds })
      .getMany();

    for (const p of pagamentos) {
      base[p.forma as keyof ValoresPorFormaPagamento] += p.valorCentavos;
    }
    // Dinheiro registrado desconta o troco dado (saída real de caixa).
    const vendasComTroco = await this.vendaRepo.find({
      where: { caixaId, status: StatusVenda.FINALIZADA },
      select: ['trocoCentavos'],
    });
    const totalTroco = vendasComTroco.reduce((s, v) => s + (v.trocoCentavos ?? 0), 0);
    base.dinheiro -= totalTroco;

    return base;
  }

  async buscarPorId(id: string): Promise<Caixa> {
    const caixa = await this.caixaRepo.findOne({ where: { id } });
    if (!caixa) {
      throw new NotFoundException('caixa não encontrado');
    }
    return caixa;
  }
}
