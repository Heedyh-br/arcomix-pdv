import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VendasService } from './vendas.service';
import { AdicionarItemDto } from './dto/adicionar-item.dto';
import { RegistrarPagamentoDto } from './dto/registrar-pagamento.dto';
import { AplicarDescontoDto } from './dto/aplicar-desconto.dto';
import { CancelarVendaFinalizadaDto } from './dto/cancelar-venda-finalizada.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('vendas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VendasController {
  constructor(private readonly service: VendasService) {}

  @Post()
  iniciar(@Req() req: any) {
    return this.service.iniciarVenda(req.user.sub);
  }

  // RNF05 - front chama isso ao abrir o app pra recuperar venda em andamento.
  @Get('em-andamento')
  buscarEmAndamento(@Req() req: any) {
    return this.service.buscarEmAndamento(req.user.sub);
  }

  @Post(':id/itens')
  adicionarItem(@Param('id') id: string, @Body() dto: AdicionarItemDto) {
    return this.service.adicionarItem(id, dto);
  }

  @Delete(':id/itens/:itemId')
  cancelarItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.service.cancelarItem(id, itemId);
  }

  @Post(':id/descontos')
  aplicarDesconto(@Param('id') id: string, @Body() dto: AplicarDescontoDto) {
    return this.service.aplicarDesconto(id, dto);
  }

  @Post(':id/pagamentos')
  registrarPagamento(@Param('id') id: string, @Body() dto: RegistrarPagamentoDto) {
    return this.service.registrarPagamento(id, dto);
  }

  // RF10 - qualquer usuário autenticado pode CHAMAR (normalmente é o Operador no
  // caixa), mas o service exige login/senha de um Supervisor no corpo da requisição
  // pra de fato autorizar — mesmo padrão usado em aplicarDesconto (RF11).
  @Post(':id/cancelar-finalizada')
  cancelarFinalizada(@Param('id') id: string, @Body() dto: CancelarVendaFinalizadaDto) {
    return this.service.cancelarVendaFinalizada(id, dto);
  }
}
