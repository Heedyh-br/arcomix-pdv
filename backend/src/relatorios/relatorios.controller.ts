import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

// RF14 - visível apenas para Supervisor/Administrador.
@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERVISOR, UserRole.ADMINISTRADOR)
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('caixa/:id')
  porCaixa(@Param('id') id: string) {
    return this.service.porCaixa(id);
  }

  @Get('periodo')
  porPeriodo(@Query('inicio') inicio: string, @Query('fim') fim: string) {
    return this.service.porPeriodo(new Date(inicio), new Date(fim));
  }
}
