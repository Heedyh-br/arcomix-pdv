import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venda } from './venda.entity';

// RF01-RF04 - item individual dentro de uma venda.
@Entity('itens_venda')
export class ItemVenda {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venda_id' })
  vendaId: string;

  @ManyToOne(() => Venda, (venda) => venda.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venda_id' })
  venda: Venda;

  @Column({ name: 'produto_id' })
  produtoId: string;

  @Column({ name: 'nome_produto', length: 150 })
  nomeProduto: string; // snapshot — nome não muda retroativamente se o produto for editado depois

  @Column({ type: 'int', default: 1 })
  quantidade: number;

  // Preenchido só quando o produto é vendido por peso (RF03).
  @Column({ name: 'peso_kg', type: 'numeric', precision: 8, scale: 3, nullable: true })
  pesoKg: number | null;

  @Column({ name: 'preco_unitario_centavos', type: 'int' })
  precoUnitarioCentavos: number;

  @Column({ name: 'subtotal_centavos', type: 'int' })
  subtotalCentavos: number;

  // RF04 - cancelamento de item antes da finalização do pagamento.
  @Column({ default: false })
  cancelado: boolean;
}
