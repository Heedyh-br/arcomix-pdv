import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venda } from './venda.entity';

export enum FormaPagamento {
  DINHEIRO = 'dinheiro',
  DEBITO = 'debito',
  CREDITO = 'credito',
  PIX = 'pix',
}

// RF06 - pagamento (permite N por venda = pagamento misto).
@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venda_id' })
  vendaId: string;

  @ManyToOne(() => Venda, (venda) => venda.pagamentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venda_id' })
  venda: Venda;

  @Column({ name: 'forma', type: 'enum', enum: FormaPagamento })
  forma: FormaPagamento;

  @Column({ name: 'valor_centavos', type: 'int' })
  valorCentavos: number;
}
