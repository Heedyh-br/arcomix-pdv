import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum StatusCaixa {
  ABERTO = 'aberto',
  FECHADO = 'fechado',
}

export interface ValoresPorFormaPagamento {
  dinheiro: number;
  debito: number;
  credito: number;
  pix: number;
}

// RF08/RF09 - abertura e fechamento de caixa (turno de um operador).
@Entity('caixas')
export class Caixa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operador_id' })
  operadorId: string;

  @Column({ name: 'fundo_troco_centavos', type: 'int' })
  fundoTrocoCentavos: number;

  @CreateDateColumn({ name: 'data_abertura' })
  dataAbertura: Date;

  @Column({ name: 'data_fechamento', type: 'timestamptz', nullable: true })
  dataFechamento: Date | null;

  @Column({ type: 'enum', enum: StatusCaixa, default: StatusCaixa.ABERTO })
  status: StatusCaixa;

  // Preenchido no fechamento: o que o operador contou fisicamente na gaveta.
  @Column({ name: 'valores_contados', type: 'jsonb', nullable: true })
  valoresContados: ValoresPorFormaPagamento | null;

  // Calculado a partir das vendas registradas no sistema durante o turno.
  @Column({ name: 'valores_registrados', type: 'jsonb', nullable: true })
  valoresRegistrados: ValoresPorFormaPagamento | null;

  // Diferença (contado - registrado) por forma de pagamento.
  @Column({ type: 'jsonb', nullable: true })
  divergencias: ValoresPorFormaPagamento | null;
}
