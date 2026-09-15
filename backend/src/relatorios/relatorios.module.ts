import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from '../vendas/venda.entity';
import { Pagamento } from '../vendas/pagamento.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { CaixaModule } from '../caixa/caixa.module';

@Module({
  imports: [TypeOrmModule.forFeature([Venda, Pagamento]), CaixaModule],
  controllers: [RelatoriosController],
  providers: [RelatoriosService],
})
export class RelatoriosModule {}
