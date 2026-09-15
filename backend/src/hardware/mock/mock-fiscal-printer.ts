import { Injectable, Logger } from '@nestjs/common';
import { IFiscalPrinter } from '../interfaces/fiscal-printer.interface';
import { CupomFiscal } from '../../vendas/cupom-fiscal.entity';

@Injectable()
export class MockFiscalPrinter implements IFiscalPrinter {
  private readonly logger = new Logger(MockFiscalPrinter.name);

  async imprimir(cupom: CupomFiscal) {
    this.logger.log(`[SIMULADO] Emitindo cupom ${cupom.numero} (chave ${cupom.chaveSimulada})`);
    return { impresso: true };
  }
}
