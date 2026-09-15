import { IsNotEmpty, IsString } from 'class-validator';

// RF10 - cancelamento de venda já finalizada exige login/senha de Supervisor.
export class CancelarVendaFinalizadaDto {
  @IsString() @IsNotEmpty() supervisorLogin: string;
  @IsString() @IsNotEmpty() supervisorSenha: string;
  @IsString() @IsNotEmpty() motivo: string;
}
