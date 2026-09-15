/** Gaveta de dinheiro — abre ao final de pagamentos com espécie envolvida. */
export interface ICashDrawer {
  abrir(): Promise<{ aberta: boolean }>;
}
export const CASH_DRAWER = 'CASH_DRAWER';
