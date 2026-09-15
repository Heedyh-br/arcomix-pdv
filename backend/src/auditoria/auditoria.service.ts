import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAuditoria, AcaoAuditoria } from './log-auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(LogAuditoria)
    private readonly repo: Repository<LogAuditoria>,
  ) {}

  async registrar(
    usuarioId: string,
    acao: AcaoAuditoria,
    detalhes?: Record<string, unknown>,
  ): Promise<void> {
    await this.repo.save(
      this.repo.create({ usuarioId, acao, detalhes: detalhes ?? null }),
    );
  }

  async listarPorPeriodo(inicio: Date, fim: Date): Promise<LogAuditoria[]> {
    return this.repo
      .createQueryBuilder('log')
      .where('log.dataHora BETWEEN :inicio AND :fim', { inicio, fim })
      .orderBy('log.dataHora', 'DESC')
      .getMany();
  }
}
