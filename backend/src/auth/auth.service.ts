import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Usuario } from '../users/user.entity';

export interface LoginResponse {
  access_token: string;
  usuario: {
    id: string;
    nome: string;
    login: string;
    perfil: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(login: string, senha: string): Promise<LoginResponse> {
    const usuario = await this.usersService.validarCredenciais(login, senha);

    if (!usuario) {
      // Mensagem genérica de propósito: não revelar se o login existe ou não.
      throw new UnauthorizedException('login ou senha inválidos');
    }

    return this.gerarResposta(usuario);
  }

  /**
   * Usado pelo módulo de cancelamentos/descontos (RF10, RF11) para exigir
   * reautenticação de um Supervisor sem derrubar a sessão do Operador atual.
   */
  async validarSupervisor(login: string, senha: string): Promise<Usuario> {
    const usuario = await this.usersService.validarCredenciais(login, senha);
    if (!usuario || usuario.perfil === 'operador') {
      throw new UnauthorizedException(
        'credenciais de supervisor inválidas ou insuficientes',
      );
    }
    return usuario;
  }

  private gerarResposta(usuario: Usuario): LoginResponse {
    const payload = {
      sub: usuario.id,
      login: usuario.login,
      perfil: usuario.perfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        perfil: usuario.perfil,
      },
    };
  }
}
