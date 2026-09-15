import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AcaoAuditoria {
  ABERTURA_CAIXA = 'abertura_caixa',
  FECHAMENTO_CAIXA = 'fechamento_caixa',
  CANCELAMENTO_ITEM = 'cancelamento_item',
  CANCELAMENTO_VENDA_FINALIZADA = 'cancelamento_venda_finalizada',
  DESCONTO_ACIMA_LIMITE = 'desconto_acima_limite',
}

/**
 * RNF08 - Auditabilidade: log de toda operação sensível, com usuário/data/hora.
 */
@Entity('logs_auditoria')
export class LogAuditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id' })
  usuarioId: string;

  @Column({ type: 'enum', enum: AcaoAuditoria })
  acao: AcaoAuditoria;

  @Column({ type: 'jsonb', nullable: true })
  detalhes: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'data_hora' })
  dataHora: Date;
}
