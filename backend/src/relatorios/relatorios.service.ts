import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venda, StatusVenda } from '../vendas/venda.entity';
import { Pagamento } from '../vendas/pagamento.entity';
import { CaixaService } from '../caixa/caixa.service';

export interface RelatorioPorFormaPagamento {
  dinheiro: number;
  debito: number;
  credito: number;
  pix: number;
  total: number;
}

// RF14 - relatório de vendas por caixa e por período, segmentado por forma de pagamento.
@Injectable()
export class RelatoriosService {
  constructor(
    @InjectRepository(Venda) private readonly vendaRepo: Repository<Venda>,
    @InjectRepository(Pagamento) private readonly pagamentoRepo: Repository<Pagamento>,
    private readonly caixaService: CaixaService,
  ) {}

  async porCaixa(caixaId: string) {
    const caixa = await this.caixaService.buscarPorId(caixaId);
    const valores = await this.caixaService.calcularValoresRegistrados(caixaId);
    const qtdVendas = await this.vendaRepo.count({
      where: { caixaId, status: StatusVenda.FINALIZADA },
    });

    return {
      caixaId,
      operadorId: caixa.operadorId,
      status: caixa.status,
      quantidadeVendas: qtdVendas,
      totaisPorFormaPagamento: {
        ...valores,
        total: valores.dinheiro + valores.debito + valores.credito + valores.pix,
      } as RelatorioPorFormaPagamento,
    };
  }

  async porPeriodo(inicio: Date, fim: Date) {
    const vendas = await this.vendaRepo.find({
      where: { status: StatusVenda.FINALIZADA },
      select: ['id', 'caixaId', 'finalizadaEm', 'valorTotalCentavos'],
    });
    const vendasNoPeriodo = vendas.filter(
      (v) => v.finalizadaEm && v.finalizadaEm >= inicio && v.finalizadaEm <= fim,
    );
    const vendaIds = vendasNoPeriodo.map((v) => v.id);

    const totais: RelatorioPorFormaPagamento = { dinheiro: 0, debito: 0, credito: 0, pix: 0, total: 0 };

    if (vendaIds.length > 0) {
      const pagamentos = await this.pagamentoRepo
        .createQueryBuilder('p')
        .where('p.vendaId IN (:...vendaIds)', { vendaIds })
        .getMany();

      for (const p of pagamentos) {
        totais[p.forma as keyof Omit<RelatorioPorFormaPagamento, 'total'>] += p.valorCentavos;
        totais.total += p.valorCentavos;
      }
    }

    return {
      periodo: { inicio, fim },
      quantidadeVendas: vendasNoPeriodo.length,
      totaisPorFormaPagamento: totais,
    };
  }
}
