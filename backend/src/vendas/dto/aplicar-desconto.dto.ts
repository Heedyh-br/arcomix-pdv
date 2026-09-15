import { IsInt, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

// RF11 - desconto acima do limite padrão exige supervisorLogin/supervisorSenha.
export class AplicarDescontoDto {
  @IsOptional()
  @IsUUID()
  itemVendaId?: string;

  @IsInt()
  @Min(1)
  valorCentavos: number;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  supervisorLogin?: string;

  @IsOptional()
  @IsString()
  supervisorSenha?: string;
}
