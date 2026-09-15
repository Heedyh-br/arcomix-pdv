import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './user.entity';

// RNF03 - só Administrador cadastra/gerencia usuários e perfis.
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const usuario = await this.usersService.create(dto);
    return this.semSenha(usuario);
  }

  @Get()
  async findAll() {
    const usuarios = await this.usersService.findAllAtivos();
    return usuarios.map((u) => this.semSenha(u));
  }

  @Delete(':id')
  async desativar(@Param('id') id: string) {
    await this.usersService.desativar(id);
    return { ok: true };
  }

  // Nunca retornar senhaHash nas respostas da API.
  private semSenha(usuario: {
    id: string;
    nome: string;
    login: string;
    perfil: string;
    ativo: boolean;
  }) {
    const { id, nome, login, perfil, ativo } = usuario;
    return { id, nome, login, perfil, ativo };
  }
}
