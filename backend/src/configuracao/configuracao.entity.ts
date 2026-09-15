import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

/**
 * Regras "configuráveis" citadas como [Suposição] na ERS — nunca hardcoded.
 * Ex: limite_desconto_padrao, prazo_cancelamento_horas.
 * RF11 - limite de desconto configurável pelo Administrador.
 */
@Entity('configuracoes_sistema')
export class ConfiguracaoSistema {
  @PrimaryColumn({ length: 60 })
  chave: string;

  @Column({ type: 'varchar', length: 200 })
  valor: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}

export const CHAVES_CONFIG = {
  LIMITE_DESCONTO_PERCENTUAL: 'limite_desconto_percentual',
  PRAZO_CANCELAMENTO_HORAS: 'prazo_cancelamento_horas',
} as const;
