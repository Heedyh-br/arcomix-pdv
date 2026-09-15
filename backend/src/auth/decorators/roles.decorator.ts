import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/user.entity';

export const ROLES_KEY = 'roles';

/**
 * Uso: @Roles(UserRole.SUPERVISOR, UserRole.ADMINISTRADOR)
 * RNF03 - controle de permissões por rota/ação.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
