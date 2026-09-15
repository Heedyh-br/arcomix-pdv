import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,60}$/, {
    message: 'login deve ter entre 3 e 60 caracteres alfanuméricos',
  })
  login: string;

  @IsString()
  @MinLength(6, { message: 'senha deve ter ao menos 6 caracteres' })
  senha: string;

  @IsEnum(UserRole, { message: 'perfil inválido' })
  perfil: UserRole;
}
