import { Injectable } from '@nestjs/common';
import { IScale } from '../interfaces/scale.interface';

@Injectable()
export class MockScale implements IScale {
  async pesar() {
    // Simulação de desenvolvimento — troque pela leitura serial real da balança.
    const pesoKg = Number((Math.random() * 2 + 0.1).toFixed(3));
    return { pesoKg };
  }
}
