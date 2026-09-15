import { IsInt, Min } from 'class-validator';

export class FecharCaixaDto {
  @IsInt() @Min(0) dinheiroContado: number;
  @IsInt() @Min(0) debitoContado: number;
  @IsInt() @Min(0) creditoContado: number;
  @IsInt() @Min(0) pixContado: number;
}
