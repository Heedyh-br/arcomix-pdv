import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly repo: Repository<Produto>,
  ) {}

  // RF12
  async create(dto: CreateProdutoDto): Promise<Produto> {
    const existente = await this.repo.findOne({
      where: { codigoBarras: dto.codigoBarras },
    });
    if (existente) {
      throw new ConflictException('código de barras já cadastrado');
    }
    return this.repo.save(this.repo.create({ ...dto, estoqueAtual: dto.estoqueAtual ?? 0 }));
  }

  async update(id: string, dto: UpdateProdutoDto): Promise<Produto> {
    const produto = await this.buscarPorId(id);
    Object.assign(produto, dto);
    return this.repo.save(produto);
  }

  // RF01 - buscar produto pelo código de barras lido no caixa.
  async buscarPorCodigoBarras(codigoBarras: string): Promise<Produto | null> {
    return this.repo.findOne({ where: { codigoBarras, ativo: true } });
  }

  async buscarPorId(id: string): Promise<Produto> {
    const produto = await this.repo.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException('produto não encontrado');
    }
    return produto;
  }

  async listar(termo?: string): Promise<Produto[]> {
    if (!termo) {
      return this.repo.find({ where: { ativo: true }, order: { nome: 'ASC' } });
    }
    return this.repo
      .createQueryBuilder('p')
      .where('p.ativo = true')
      .andWhere('(p.nome ILIKE :termo OR p.codigoBarras ILIKE :termo)', {
        termo: `%${termo}%`,
      })
      .orderBy('p.nome', 'ASC')
      .getMany();
  }

  // RF13 - consultar estoque disponível de um produto.
  async consultarEstoque(id: string): Promise<{ produtoId: string; estoqueAtual: number }> {
    const produto = await this.buscarPorId(id);
    return { produtoId: produto.id, estoqueAtual: produto.estoqueAtual };
  }

  // Usado pelo módulo de vendas ao finalizar pagamento — baixa de estoque.
  async debitarEstoque(id: string, quantidade: number): Promise<void> {
    await this.repo.decrement({ id }, 'estoqueAtual', quantidade);
  }

  async desativar(id: string): Promise<void> {
    await this.repo.update(id, { ativo: false });
  }
}
