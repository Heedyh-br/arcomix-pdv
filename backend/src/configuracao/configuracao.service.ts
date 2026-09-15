import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracaoSistema, CHAVES_CONFIG } from './configuracao.entity';

const PADROES: Record<string, { valor: string; descricao: string }> = {
  [CHAVES_CONFIG.LIMITE_DESCONTO_PERCENTUAL]: {
    valor: '10',
    descricao: 'Desconto máximo (%) que o Operador pode aplicar sem autorização de Supervisor',
  },
  [CHAVES_CONFIG.PRAZO_CANCELAMENTO_HORAS]: {
    valor: '2',
    descricao: 'Prazo, em horas após a finalização, para cancelar uma venda já paga',
  },
};

@Injectable()
export class ConfiguracaoService implements OnModuleInit {
  constructor(
    @InjectRepository(ConfiguracaoSistema)
    private readonly repo: Repository<ConfiguracaoSistema>,
  ) {}

  async onModuleInit() {
    for (const [chave, { valor, descricao }] of Object.entries(PADROES)) {
      const existente = await this.repo.findOne({ where: { chave } });
      if (!existente) {
        await this.repo.save(this.repo.create({ chave, valor, descricao }));
      }
    }
  }

  async obterNumero(chave: string): Promise<number> {
    const config = await this.repo.findOne({ where: { chave } });
    return config ? Number(config.valor) : Number(PADROES[chave]?.valor ?? 0);
  }

  async listar(): Promise<ConfiguracaoSistema[]> {
    return this.repo.find();
  }

  // RF11 - só o Administrador altera (garantido pelo controller via @Roles).
  async atualizar(chave: string, valor: string): Promise<ConfiguracaoSistema> {
    await this.repo.update(chave, { valor });
    return this.repo.findOneOrFail({ where: { chave } });
  }
}
