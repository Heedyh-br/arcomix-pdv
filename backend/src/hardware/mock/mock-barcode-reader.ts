import { Injectable } from '@nestjs/common';
import { IBarcodeReader } from '../interfaces/barcode-reader.interface';

@Injectable()
export class MockBarcodeReader implements IBarcodeReader {
  async ler(codigo: string) {
    return { codigoBarras: codigo, lidoEm: new Date() };
  }
}
