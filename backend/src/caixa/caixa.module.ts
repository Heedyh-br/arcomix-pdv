import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Caixa } from './caixa.entity';
import { Venda } from '../vendas/venda.entity';
import { Pagamento } from '../vendas/pagamento.entity';
import { CaixaService } from './caixa.service';
import { CaixaController } from './caixa.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

// Só usa as ENTIDADES de vendas (Venda, Pagamento) pra apurar os totais do
// turno — não importa o VendasModule, evitando dependência circular (é o
// VendasModule que depende do CaixaModule, e não o contrário).
@Module({
  imports: [TypeOrmModule.forFeature([Caixa, Venda, Pagamento]), AuditoriaModule],
  controllers: [CaixaController],
  providers: [CaixaService],
  exports: [CaixaService],
})
export class CaixaModule {}
