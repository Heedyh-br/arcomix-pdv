import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UnidadeProduto {
  UNIDADE = 'un',
  QUILO = 'kg',
}

// RF12 - Cadastrar/atualizar produto (nome, código de barras único, preço, categoria, unidade).
@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'codigo_barras', length: 64, unique: true })
  codigoBarras: string;

  @Column({ length: 150 })
  nome: string;

  // Guardado em centavos pra evitar erro de ponto flutuante em dinheiro.
  @Column({ name: 'preco_centavos', type: 'int' })
  precoCentavos: number;

  // Preço por kg (também em centavos), usado quando unidade = kg (RF03).
  @Column({ name: 'preco_kg_centavos', type: 'int', nullable: true })
  precoKgCentavos: number | null;

  @Column({ length: 60 })
  categoria: string;

  @Column({ type: 'enum', enum: UnidadeProduto, default: UnidadeProduto.UNIDADE })
  unidade: UnidadeProduto;

  // RF13 - consultar estoque disponível.
  @Column({ name: 'estoque_atual', type: 'int', default: 0 })
  estoqueAtual: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
