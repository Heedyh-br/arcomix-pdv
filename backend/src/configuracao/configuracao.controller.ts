import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('configuracoes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR)
export class ConfiguracaoController {
  constructor(private readonly service: ConfiguracaoService) {}

  @Get()
  listar() {
    return this.service.listar();
  }

  @Put(':chave')
  atualizar(@Param('chave') chave: string, @Body('valor') valor: string) {
    return this.service.atualizar(chave, valor);
  }
}
