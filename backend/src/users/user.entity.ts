import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Perfis de acesso do sistema.
 * RNF03 - Segurança: perfis distintos com permissões diferentes por rota/ação.
 */
export enum UserRole {
  OPERADOR = 'operador',
  SUPERVISOR = 'supervisor',
  ADMINISTRADOR = 'administrador',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  nome: string;

  @Index({ unique: true })
  @Column({ length: 60, unique: true })
  login: string;

  // Nunca armazenar senha em texto puro. Hash gerado com bcrypt (ver UsersService).
  @Column({ name: 'senha_hash' })
  senhaHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.OPERADOR,
  })
  perfil: UserRole;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
