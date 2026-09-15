import { IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

// RF01/RF02 - por código de barras OU por produtoId já resolvido no front.
// RF03 - pesoKg preenchido quando o produto é vendido por peso.
export class AdicionarItemDto {
  @IsOptional()
  @IsUUID()
  produtoId?: string;

  @IsOptional()
  @IsString()
  codigoBarras?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  pesoKg?: number;
}
