import { Injectable } from '@nestjs/common';
import { ICashDrawer } from '../interfaces/cash-drawer.interface';

@Injectable()
export class MockCashDrawer implements ICashDrawer {
  async abrir() {
    return { aberta: true };
  }
}
