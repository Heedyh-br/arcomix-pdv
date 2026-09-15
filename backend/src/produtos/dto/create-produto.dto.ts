import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { UnidadeProduto } from '../produto.entity';

export class CreateProdutoDto {
  @IsString()
  @IsNotEmpty()
  codigoBarras: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsInt()
  @Min(0)
  precoCentavos: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  precoKgCentavos?: number;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsEnum(UnidadeProduto)
  unidade: UnidadeProduto;

  @IsOptional()
  @IsInt()
  @Min(0)
  estoqueAtual?: number;
}
