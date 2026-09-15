import { IsEnum, IsInt, Min } from 'class-validator';
import { FormaPagamento } from '../pagamento.entity';

export class RegistrarPagamentoDto {
  @IsEnum(FormaPagamento)
  forma: FormaPagamento;

  @IsInt()
  @Min(1)
  valorCentavos: number;
}
