import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProdutosModule } from './produtos/produtos.module';
import { CaixaModule } from './caixa/caixa.module';
import { VendasModule } from './vendas/vendas.module';
import { ConfiguracaoModule } from './configuracao/configuracao.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { HardwareModule } from './hardware/hardware.module';
import { Usuario } from './users/user.entity';
import { Produto } from './produtos/produto.entity';
import { Caixa } from './caixa/caixa.entity';
import { Venda } from './vendas/venda.entity';
import { ItemVenda } from './vendas/item-venda.entity';
import { Pagamento } from './vendas/pagamento.entity';
import { CupomFiscal } from './vendas/cupom-fiscal.entity';
import { Desconto } from './vendas/desconto.entity';
import { ConfiguracaoSistema } from './configuracao/configuracao.entity';
import { LogAuditoria } from './auditoria/log-auditoria.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const conexao = databaseUrl
          ? {
              url: databaseUrl,
              // Neon/Supabase/Render exigem SSL; certificado autoassinado, então
              // rejectUnauthorized: false (comum nesses provedores gratuitos).
              ssl: { rejectUnauthorized: false },
            }
          : {
              host: config.get<string>('DB_HOST', 'localhost'),
              port: config.get<number>('DB_PORT', 5432),
              username: config.get<string>('DB_USER', 'postgres'),
              password: config.get<string>('DB_PASSWORD', 'postgres'),
              database: config.get<string>('DB_NAME', 'arcomix_pdv'),
            };

        return {
          type: 'postgres' as const,
          ...conexao,
          entities: [
            Usuario,
            Produto,
            Caixa,
            Venda,
            ItemVenda,
            Pagamento,
            CupomFiscal,
            Desconto,
            ConfiguracaoSistema,
            LogAuditoria,
          ],
          // Sem migrations configuradas ainda: manter true cria as tabelas
          // automaticamente no primeiro deploy. Para um projeto real em
          // produção, troque por migrations.
          synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        };
      },
    }),
    UsersModule,
    AuthModule,
    ProdutosModule,
    ConfiguracaoModule,
    AuditoriaModule,
    HardwareModule,
    CaixaModule,
    VendasModule,
    RelatoriosModule,
  ],
})
export class AppModule {}
