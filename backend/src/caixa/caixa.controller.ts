import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CaixaService } from './caixa.service';
import { AbrirCaixaDto } from './dto/abrir-caixa.dto';
import { FecharCaixaDto } from './dto/fechar-caixa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('caixas')
@UseGuards(JwtAuthGuard)
export class CaixaController {
  constructor(private readonly service: CaixaService) {}

  // RF08
  @Post('abrir')
  abrir(@Req() req: any, @Body() dto: AbrirCaixaDto) {
    return this.service.abrir(req.user.sub, dto);
  }

  @Get('aberto')
  buscarAberto(@Req() req: any) {
    return this.service.buscarCaixaAbertoDoOperador(req.user.sub);
  }

  // RF09
  @Post(':id/fechar')
  fechar(@Req() req: any, @Param('id') id: string, @Body() dto: FecharCaixaDto) {
    return this.service.fechar(id, req.user.sub, dto);
  }
}
