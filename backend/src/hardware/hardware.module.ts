import { Module } from '@nestjs/common';
import { BARCODE_READER } from './interfaces/barcode-reader.interface';
import { SCALE } from './interfaces/scale.interface';
import { FISCAL_PRINTER } from './interfaces/fiscal-printer.interface';
import { CASH_DRAWER } from './interfaces/cash-drawer.interface';
import { MockBarcodeReader } from './mock/mock-barcode-reader';
import { MockScale } from './mock/mock-scale';
import { MockFiscalPrinter } from './mock/mock-fiscal-printer';
import { MockCashDrawer } from './mock/mock-cash-drawer';

/**
 * RNF07 - todo o resto do sistema depende das INTERFACES (tokens abaixo),
 * nunca das classes mock diretamente. Trocar por hardware real = trocar
 * só os providers aqui.
 */
@Module({
  providers: [
    { provide: BARCODE_READER, useClass: MockBarcodeReader },
    { provide: SCALE, useClass: MockScale },
    { provide: FISCAL_PRINTER, useClass: MockFiscalPrinter },
    { provide: CASH_DRAWER, useClass: MockCashDrawer },
  ],
  exports: [BARCODE_READER, SCALE, FISCAL_PRINTER, CASH_DRAWER],
})
export class HardwareModule {}
