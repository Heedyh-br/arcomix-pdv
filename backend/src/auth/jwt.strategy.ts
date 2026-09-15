import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUserPayload } from './decorators/current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-troque-isso'),
    });
  }

  // O retorno aqui é anexado a request.user pelo Passport.
  async validate(payload: {
    sub: string;
    login: string;
    perfil: string;
  }): Promise<JwtUserPayload> {
    return { sub: payload.sub, login: payload.login, perfil: payload.perfil };
  }
}
