import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venda } from './venda.entity';
import { ItemVenda } from './item-venda.entity';
import { Pagamento } from './pagamento.entity';
import { CupomFiscal } from './cupom-fiscal.entity';
import { Desconto } from './desconto.entity';
import { VendasService } from './vendas.service';
import { VendasController } from './vendas.controller';
import { ProdutosModule } from '../produtos/produtos.module';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { AuthModule } from '../auth/auth.module';
import { CaixaModule } from '../caixa/caixa.module';
import { HardwareModule } from '../hardware/hardware.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venda, ItemVenda, Pagamento, CupomFiscal, Desconto]),
    ProdutosModule,
    ConfiguracaoModule,
    AuditoriaModule,
    AuthModule,
    CaixaModule,
    HardwareModule,
  ],
  controllers: [VendasController],
  providers: [VendasService],
  exports: [VendasService],
})
export class VendasModule {}
