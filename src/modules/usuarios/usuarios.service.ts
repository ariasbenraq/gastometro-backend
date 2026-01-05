import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { UserRole } from '../auth/dto/signup.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll() {
    const usuarios = await this.usuarioRepository.find({
      relations: ['rol'],
      order: { id: 'ASC' },
    });

    return usuarios.map((usuario) => this.sanitizeUser(usuario));
  }

  async approveAnalyst(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (usuario.rol?.nombre !== UserRole.ANALYST_BALANCE) {
      throw new BadRequestException('El usuario no es un analista.');
    }

    usuario.activo = true;
    const savedUser = await this.usuarioRepository.save(usuario);
    return this.sanitizeUser(savedUser);
  }

  async updateBasic(
    id: number,
    dto: UpdateUsuarioDto,
    currentUser?: AuthenticatedUser,
  ) {
    if (
      currentUser?.rol !== UserRole.ADMIN &&
      currentUser?.userId !== id
    ) {
      throw new ForbiddenException('No tiene permisos para actualizar este perfil.');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (dto.email && dto.email !== usuario.email) {
      const existingUser = await this.usuarioRepository.findOne({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('El email ya existe.');
      }
    }

    Object.assign(usuario, dto);
    const savedUser = await this.usuarioRepository.save(usuario);
    return this.sanitizeUser(savedUser);
  }

  private sanitizeUser(usuario: Usuario) {
    return {
      id: usuario.id,
      nombre_apellido: usuario.nombre_apellido,
      usuario: usuario.usuario,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
      rol: usuario.rol?.nombre ?? usuario.rol?.id ?? null,
    };
  }
}
