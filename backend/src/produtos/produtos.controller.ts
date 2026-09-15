import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('produtos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  // Qualquer usuário autenticado pode consultar (necessário no fluxo de venda).
  @Get()
  listar(@Query('termo') termo?: string) {
    return this.service.listar(termo);
  }

  @Get('codigo-barras/:codigo')
  buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.service.buscarPorCodigoBarras(codigo);
  }

  @Get(':id/estoque')
  consultarEstoque(@Param('id') id: string) {
    return this.service.consultarEstoque(id);
  }

  // RF12 - cadastro/atualização exige Supervisor ou Administrador.
  @Post()
  @Roles(UserRole.SUPERVISOR, UserRole.ADMINISTRADOR)
  create(@Body() dto: CreateProdutoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERVISOR, UserRole.ADMINISTRADOR)
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.service.update(id, dto);
  }
}
