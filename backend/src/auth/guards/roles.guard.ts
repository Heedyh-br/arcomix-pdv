import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/user.entity';

/**
 * RNF03 - controle de permissões por rota/ação.
 * Deve ser usado SEMPRE depois do JwtAuthGuard (precisa de request.user já populado).
 * Ex: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.SUPERVISOR)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Rota sem @Roles(): qualquer usuário autenticado passa.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.perfil);
  }
}
