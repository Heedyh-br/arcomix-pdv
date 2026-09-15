import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Venda, StatusVenda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Pagamento, FormaPagamento } from './pagamento.entity';
import { CupomFiscal } from './cupom-fiscal.entity';
import { Desconto } from './desconto.entity';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';
import { AplicarDescontoDto } from './dto/aplicar-desconto.dto';
import { CancelarVendaFinalizadaDto } from './dto/cancelar-venda-finalizada.dto';
import { ProdutosService } from '../produtos/produtos.service';
import { Produto, UnidadeProduto } from '../produtos/produto.entity';
import { ConfiguracaoService } from '../configuracao/configuracao.service';
import { CHAVES_CONFIG } from '../configuracao/configuracao.entity';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/log-auditoria.entity';
import { AuthService } from '../auth/auth.service';
import { CaixaService } from '../caixa/caixa.service';
import { FISCAL_PRINTER } from '../hardware/interfaces/fiscal-printer.interface';
import type { IFiscalPrinter } from '../hardware/interfaces/fiscal-printer.interface';

@Injectable()
export class VendasService {
  constructor(
    @InjectRepository(Venda) private readonly vendaRepo: Repository<Venda>,
    @InjectRepository(ItemVenda) private readonly itemRepo: Repository<ItemVenda>,
    @InjectRepository(Pagamento) private readonly pagamentoRepo: Repository<Pagamento>,
    @InjectRepository(CupomFiscal) private readonly cupomRepo: Repository<CupomFiscal>,
    @InjectRepository(Desconto) private readonly descontoRepo: Repository<Desconto>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly produtosService: ProdutosService,
    private readonly configuracaoService: ConfiguracaoService,
    private readonly auditoriaService: AuditoriaService,
    private readonly authService: AuthService,
    private readonly caixaService: CaixaService,
    @Inject(FISCAL_PRINTER) private readonly impressora: IFiscalPrinter,
  ) {}

  // RF08 (dependência) - não permite vender sem caixa aberto.
  async iniciarVenda(operadorId: string): Promise<Venda> {
    const caixa = await this.caixaService.buscarCaixaAbertoDoOperador(operadorId);
    if (!caixa) {
      throw new BadRequestException('não é possível iniciar venda sem caixa aberto');
    }

    // RNF05 - venda persistida desde o primeiro instante (recuperável após queda).
    const venda = this.vendaRepo.create({
      caixaId: caixa.id,
      operadorId,
      status: StatusVenda.EM_ANDAMENTO,
      valorTotalCentavos: 0,
    });
    return this.vendaRepo.save(venda);
  }

  // RNF05 - permite recuperar a venda em andamento após queda/reinício do app.
  async buscarEmAndamento(operadorId: string): Promise<Venda | null> {
    return this.vendaRepo.findOne({
      where: { operadorId, status: StatusVenda.EM_ANDAMENTO },
      relations: ['itens', 'pagamentos'],
      order: { iniciadaEm: 'DESC' },
    });
  }

  // RF01/RF02/RF03 - adiciona item por código de barras/id, com ou sem peso.
  async adicionarItem(vendaId: string, dto: AdicionarItemDto): Promise<Venda> {
    const venda = await this.buscarVendaAtiva(vendaId);

    const produto = dto.produtoId
      ? await this.produtosService.buscarPorId(dto.produtoId)
      : dto.codigoBarras
        ? await this.produtosService.buscarPorCodigoBarras(dto.codigoBarras)
        : null;

    if (!produto) {
      // RF01 - produto não encontrado: o front deve oferecer cadastro rápido
      // (rota RF12, restrita a Supervisor/Administrador).
      throw new NotFoundException('produto não encontrado para o código informado');
    }

    let quantidade = dto.quantidade ?? 1;
    let pesoKg: number | null = null;
    let subtotalCentavos: number;

    if (produto.unidade === UnidadeProduto.QUILO) {
      if (!dto.pesoKg || !produto.precoKgCentavos) {
        throw new BadRequestException('produto vendido por peso: informe pesoKg e cadastre precoKgCentavos');
      }
      pesoKg = dto.pesoKg;
      quantidade = 1;
      // RF03 - valor = peso x preço/kg.
      subtotalCentavos = Math.round(pesoKg * produto.precoKgCentavos);
    } else {
      subtotalCentavos = quantidade * produto.precoCentavos;
    }

    const item = this.itemRepo.create({
      vendaId: venda.id,
      produtoId: produto.id,
      nomeProduto: produto.nome,
      quantidade,
      pesoKg,
      precoUnitarioCentavos: produto.unidade === UnidadeProduto.QUILO
        ? (produto.precoKgCentavos as number)
        : produto.precoCentavos,
      subtotalCentavos,
      cancelado: false,
    });
    await this.itemRepo.save(item);

    return this.recalcularTotal(venda.id);
  }

  // RF04 - cancelar item ANTES da finalização do pagamento, recalculando o total.
  async cancelarItem(vendaId: string, itemId: string): Promise<Venda> {
    const venda = await this.buscarVendaAtiva(vendaId);

    const item = await this.itemRepo.findOne({ where: { id: itemId, vendaId: venda.id } });
    if (!item) {
      throw new NotFoundException('item não encontrado nesta venda');
    }
    item.cancelado = true;
    await this.itemRepo.save(item);

    return this.recalcularTotal(venda.id);
  }

  // RF11 - desconto acima do limite padrão exige autenticação de Supervisor.
  async aplicarDesconto(vendaId: string, dto: AplicarDescontoDto): Promise<Venda> {
    const venda = await this.buscarVendaAtiva(vendaId);

    const limitePercentual = await this.configuracaoService.obterNumero(
      CHAVES_CONFIG.LIMITE_DESCONTO_PERCENTUAL,
    );
    const percentualDesconto = (dto.valorCentavos / Math.max(venda.valorTotalCentavos, 1)) * 100;

    let autorizadoPor: string | null = null;

    if (percentualDesconto > limitePercentual) {
      if (!dto.supervisorLogin || !dto.supervisorSenha) {
        throw new ForbiddenException(
          `desconto de ${percentualDesconto.toFixed(1)}% excede o limite de ${limitePercentual}% — autorização de Supervisor necessária`,
        );
      }
      const supervisor = await this.authService.validarSupervisor(
        dto.supervisorLogin,
        dto.supervisorSenha,
      );
      autorizadoPor = supervisor.id;

      // RNF08 - operação sensível: registra no log de auditoria.
      await this.auditoriaService.registrar(supervisor.id, AcaoAuditoria.DESCONTO_ACIMA_LIMITE, {
        vendaId: venda.id,
        valorCentavos: dto.valorCentavos,
        percentual: Number(percentualDesconto.toFixed(2)),
        motivo: dto.motivo ?? null,
      });
    }

    const desconto = this.descontoRepo.create({
      vendaId: venda.id,
      itemVendaId: dto.itemVendaId ?? null,
      valorCentavos: dto.valorCentavos,
      percentual: Number(percentualDesconto.toFixed(2)),
      autorizadoPor,
      motivo: dto.motivo ?? null,
    });
    await this.descontoRepo.save(desconto);

    return this.recalcularTotal(venda.id);
  }

  // RF05/RF06 - registra pagamento (permite chamadas sucessivas = pagamento misto).
  async registrarPagamento(vendaId: string, dto: RegistrarPagamentoDto): Promise<Venda> {
    const venda = await this.buscarVendaAtiva(vendaId);

    const jaPago = (venda.pagamentos ?? []).reduce((s, p) => s + p.valorCentavos, 0);
    const restante = venda.valorTotalCentavos - jaPago;

    // RF05 - troco só se aplica a dinheiro; outras formas não podem exceder o restante.
    if (dto.forma !== FormaPagamento.DINHEIRO && dto.valorCentavos > restante) {
      throw new BadRequestException(
        `pagamento em ${dto.forma} não pode exceder o valor restante (${restante} centavos)`,
      );
    }

    const pagamento = this.pagamentoRepo.create({
      vendaId: venda.id,
      forma: dto.forma,
      valorCentavos: dto.valorCentavos,
    });
    await this.pagamentoRepo.save(pagamento);

    const totalPago = jaPago + dto.valorCentavos;
    if (totalPago >= venda.valorTotalCentavos) {
      return this.finalizarVenda(venda.id);
    }

    return this.buscarVendaAtiva(vendaId);
  }

  // RF07 - emissão de cupom fiscal simulado ao final da venda.
  private async finalizarVenda(vendaId: string): Promise<Venda> {
    return this.dataSource.transaction(async (manager) => {
      const venda = await manager.findOneOrFail(Venda, {
        where: { id: vendaId },
        relations: ['itens', 'pagamentos'],
      });

      const totalPago = venda.pagamentos.reduce((s, p) => s + p.valorCentavos, 0);
      const excedente = totalPago - venda.valorTotalCentavos;
      // RF05 - troco calculado automaticamente (assume-se que o excedente veio em dinheiro).
      venda.trocoCentavos = excedente > 0 ? excedente : null;
      venda.status = StatusVenda.FINALIZADA;
      venda.finalizadaEm = new Date();
      await manager.save(venda);

      // Baixa de estoque dos itens não cancelados.
      for (const item of venda.itens.filter((i) => !i.cancelado)) {
        if (item.pesoKg) {
          // [Suposição] estoque de granel/peso é controlado à parte (por lote), não por unidade aqui.
          continue;
        }
        await manager.decrement(Produto, { id: item.produtoId }, 'estoqueAtual', item.quantidade);
      }

      const cupom = manager.create(CupomFiscal, {
        vendaId: venda.id,
        numero: venda.id.slice(0, 8).toUpperCase(),
        chaveSimulada: randomBytes(22).toString('hex').slice(0, 44),
        valorTotalCentavos: venda.valorTotalCentavos,
        itens: venda.itens
          .filter((i) => !i.cancelado)
          .map((i) => ({
            nomeProduto: i.nomeProduto,
            quantidade: i.quantidade,
            pesoKg: i.pesoKg,
            precoUnitarioCentavos: i.precoUnitarioCentavos,
            subtotalCentavos: i.subtotalCentavos,
          })),
        pagamentos: venda.pagamentos.map((p) => ({ forma: p.forma, valorCentavos: p.valorCentavos })),
      });
      await manager.save(cupom);
      await this.impressora.imprimir(cupom);

      return venda;
    });
  }

  // RF10 - cancelamento de venda JÁ FINALIZADA exige Supervisor.
  async cancelarVendaFinalizada(
    vendaId: string,
    dto: CancelarVendaFinalizadaDto,
  ): Promise<Venda> {
    const venda = await this.vendaRepo.findOne({ where: { id: vendaId } });
    if (!venda) {
      throw new NotFoundException('venda não encontrada');
    }
    if (venda.status !== StatusVenda.FINALIZADA) {
      throw new BadRequestException('só é possível cancelar uma venda já finalizada por esta rota');
    }

    const prazoHoras = await this.configuracaoService.obterNumero(
      CHAVES_CONFIG.PRAZO_CANCELAMENTO_HORAS,
    );
    const horasDecorridas =
      (Date.now() - (venda.finalizadaEm as Date).getTime()) / 3_600_000;
    if (horasDecorridas > prazoHoras) {
      throw new ForbiddenException(
        `prazo de cancelamento (${prazoHoras}h após a venda) expirado`,
      );
    }

    const supervisor = await this.authService.validarSupervisor(
      dto.supervisorLogin,
      dto.supervisorSenha,
    );

    venda.status = StatusVenda.CANCELADA;
    venda.canceladaPor = supervisor.id;
    venda.motivoCancelamento = dto.motivo;
    await this.vendaRepo.save(venda);

    // RNF08 - log obrigatório dessa operação sensível.
    await this.auditoriaService.registrar(
      supervisor.id,
      AcaoAuditoria.CANCELAMENTO_VENDA_FINALIZADA,
      { vendaId: venda.id, motivo: dto.motivo },
    );

    return venda;
  }

  private async recalcularTotal(vendaId: string): Promise<Venda> {
    const venda = await this.buscarVendaAtiva(vendaId);
    const subtotalItens = venda.itens
      .filter((i) => !i.cancelado)
      .reduce((s, i) => s + i.subtotalCentavos, 0);

    const descontos = await this.descontoRepo.find({ where: { vendaId } });
    const totalDescontos = descontos.reduce((s, d) => s + d.valorCentavos, 0);

    venda.valorTotalCentavos = Math.max(subtotalItens - totalDescontos, 0);
    return this.vendaRepo.save(venda);
  }

  private async buscarVendaAtiva(vendaId: string): Promise<Venda> {
    const venda = await this.vendaRepo.findOne({
      where: { id: vendaId },
      relations: ['itens', 'pagamentos'],
    });
    if (!venda) {
      throw new NotFoundException('venda não encontrada');
    }
    if (venda.status !== StatusVenda.EM_ANDAMENTO) {
      throw new BadRequestException('esta venda não está mais em andamento');
    }
    return venda;
  }
}
