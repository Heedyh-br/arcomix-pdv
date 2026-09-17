import { api } from './api';
import { Caixa, FecharCaixaPayload } from '../types/caixa';

// RF08 - devolve o caixa aberto do operador logado, ou null se não houver.
export async function buscarCaixaAberto(): Promise<Caixa | null> {
  const { data } = await api.get<Caixa | ''>('/caixas/aberto');
  // TypeORM findOne devolve null; alguns proxies convertem corpo vazio em ''.
  return data ? (data as Caixa) : null;
}

// RF08 - abre um novo turno de caixa com o fundo de troco informado.
export async function abrirCaixa(fundoTrocoCentavos: number): Promise<Caixa> {
  const { data } = await api.post<Caixa>('/caixas/abrir', { fundoTrocoCentavos });
  return data;
}

// RF09 - fecha o caixa, enviando o que foi contado fisicamente na gaveta.
export async function fecharCaixa(
  caixaId: string,
  payload: FecharCaixaPayload,
): Promise<Caixa> {
  const { data } = await api.post<Caixa>(`/caixas/${caixaId}/fechar`, payload);
  return data;
}
