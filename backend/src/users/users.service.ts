import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateUserDto): Promise<Usuario> {
    const existente = await this.usuariosRepository.findOne({
      where: { login: dto.login },
    });
    if (existente) {
      throw new ConflictException('login já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, SALT_ROUNDS);

    const usuario = this.usuariosRepository.create({
      nome: dto.nome,
      login: dto.login,
      senhaHash,
      perfil: dto.perfil,
    });

    return this.usuariosRepository.save(usuario);
  }

  async findByLogin(login: string): Promise<Usuario | null> {
    return this.usuariosRepository.findOne({ where: { login } });
  }

  async findById(id: string): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('usuário não encontrado');
    }
    return usuario;
  }

  async findAllAtivos(): Promise<Usuario[]> {
    return this.usuariosRepository.find({ where: { ativo: true } });
  }

  async desativar(id: string): Promise<void> {
    await this.usuariosRepository.update(id, { ativo: false });
  }

  async validarCredenciais(
    login: string,
    senha: string,
  ): Promise<Usuario | null> {
    const usuario = await this.findByLogin(login);
    if (!usuario || !usuario.ativo) {
      return null;
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    return senhaValida ? usuario : null;
  }
}
