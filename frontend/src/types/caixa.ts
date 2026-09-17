export type StatusCaixa = 'aberto' | 'fechado';

export interface ValoresPorFormaPagamento {
  dinheiro: number;
  debito: number;
  credito: number;
  pix: number;
}

export interface Caixa {
  id: string;
  operadorId: string;
  fundoTrocoCentavos: number;
  dataAbertura: string;
  dataFechamento: string | null;
  status: StatusCaixa;
  valoresContados: ValoresPorFormaPagamento | null;
  valoresRegistrados: ValoresPorFormaPagamento | null;
  divergencias: ValoresPorFormaPagamento | null;
}

export interface FecharCaixaPayload {
  dinheiroContado: number;
  debitoContado: number;
  creditoContado: number;
  pixContado: number;
}
