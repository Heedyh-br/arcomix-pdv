/**
 * RNF07 - abstração de hardware. Implementação real (USB/serial/WebHID)
 * troca este mock sem tocar na lógica de negócio.
 */
export interface IBarcodeReader {
  ler(codigo: string): Promise<{ codigoBarras: string; lidoEm: Date }>;
}
export const BARCODE_READER = 'BARCODE_READER';
