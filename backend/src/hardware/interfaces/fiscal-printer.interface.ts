import { CupomFiscal } from '../../vendas/cupom-fiscal.entity';

/**
 * RF07/RNF04 - emissão de cupom. Implementação real seria integração
 * SAT/NFC-e homologada; aqui só simulamos a "impressão".
 */
export interface IFiscalPrinter {
  imprimir(cupom: CupomFiscal): Promise<{ impresso: boolean }>;
}
export const FISCAL_PRINTER = 'FISCAL_PRINTER';
