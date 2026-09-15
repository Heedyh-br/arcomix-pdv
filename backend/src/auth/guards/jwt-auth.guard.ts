import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * RNF03 - autenticação obrigatória. Aplicar globalmente ou por controller/rota.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
