import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * RF11 - desconto acima do limite padrão exige autorização de Supervisor.
 * Registrado separado do ItemVenda pra manter rastro de quem autorizou e por quê
 * (auditoria — RNF08).
 */
@Entity('descontos')
export class Desconto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venda_id' })
  vendaId: string;

  // Nulo = desconto aplicado sobre o total da venda, não sobre um item específico.
  @Column({ name: 'item_venda_id', type: 'varchar', nullable: true })
  itemVendaId: string | null;

  @Column({ name: 'valor_centavos', type: 'int' })
  valorCentavos: number;

  @Column({ name: 'percentual', type: 'numeric', precision: 5, scale: 2, nullable: true })
  percentual: number | null;

  // Preenchido só quando o desconto passou do limite padrão do Operador.
  @Column({ name: 'autorizado_por', type: 'varchar', nullable: true })
  autorizadoPor: string | null;

  @Column({ type: 'text', nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}
