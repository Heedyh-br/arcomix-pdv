import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ItemVenda } from './item-venda.entity';
import { Pagamento } from './pagamento.entity';

export enum StatusVenda {
  EM_ANDAMENTO = 'em_andamento',
  FINALIZADA = 'finalizada',
  CANCELADA = 'cancelada',
}

// RF04-RF07 - venda em si (carrinho -> pagamento -> cupom).
@Entity('vendas')
export class Venda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'caixa_id' })
  caixaId: string;

  @Column({ name: 'operador_id' })
  operadorId: string;

  @Column({ type: 'enum', enum: StatusVenda, default: StatusVenda.EM_ANDAMENTO })
  status: StatusVenda;

  @Column({ name: 'valor_total_centavos', type: 'int', default: 0 })
  valorTotalCentavos: number;

  @Column({ name: 'troco_centavos', type: 'int', nullable: true })
  trocoCentavos: number | null;

  // RF10 - preenchidos quando uma venda já finalizada é cancelada por Supervisor.
  @Column({ name: 'cancelada_por', nullable: true })
  canceladaPor: string | null;

  @Column({ name: 'motivo_cancelamento', type: 'text', nullable: true })
  motivoCancelamento: string | null;

  @CreateDateColumn({ name: 'iniciada_em' })
  iniciadaEm: Date;

  @Column({ name: 'finalizada_em', type: 'timestamptz', nullable: true })
  finalizadaEm: Date | null;

  @UpdateDateColumn({ name: 'atualizada_em' })
  atualizadaEm: Date;

  @OneToMany(() => ItemVenda, (item) => item.venda, { cascade: true })
  itens: ItemVenda[];

  @OneToMany(() => Pagamento, (pagamento) => pagamento.venda, { cascade: true })
  pagamentos: Pagamento[];
}
