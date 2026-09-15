import { IsInt, Min } from 'class-validator';

export class AbrirCaixaDto {
  @IsInt()
  @Min(0)
  fundoTrocoCentavos: number;
}
