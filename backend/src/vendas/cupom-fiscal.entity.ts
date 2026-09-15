import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * RF07/RNF04 - estrutura de campos equivalente a um NFC-e/SAT, porém
 * SIMULADA: sem integração real com SEFAZ (ver limitações no README).
 */
@Entity('cupons_fiscais')
export class CupomFiscal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'venda_id', unique: true })
  vendaId: string;

  @Column({ length: 20 })
  numero: string;

  // Simula a "chave de acesso" de 44 dígitos de uma NFC-e real.
  @Column({ name: 'chave_simulada', length: 44 })
  chaveSimulada: string;

  @Column({ name: 'valor_total_centavos', type: 'int' })
  valorTotalCentavos: number;

  // Snapshot dos itens e formas de pagamento no momento da emissão.
  @Column({ type: 'jsonb' })
  itens: Array<{
    nomeProduto: string;
    quantidade: number;
    pesoKg: number | null;
    precoUnitarioCentavos: number;
    subtotalCentavos: number;
  }>;

  @Column({ type: 'jsonb' })
  pagamentos: Array<{ forma: string; valorCentavos: number }>;

  @CreateDateColumn({ name: 'emitido_em' })
  emitidoEm: Date;
}
