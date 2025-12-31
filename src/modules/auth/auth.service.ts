import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../../entities/usuario.entity';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const existingUser = await this.usuarioRepository.findOne({
      where: [{ usuario: signUpDto.usuario }, { email: signUpDto.email }],
    });

    if (existingUser?.usuario === signUpDto.usuario) {
      throw new ConflictException('El usuario ya existe.');
    }

    if (existingUser?.email === signUpDto.email) {
      throw new ConflictException('El email ya existe.');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') ?? 10);
    const passwordHash = await bcrypt.hash(signUpDto.password, saltRounds);

    const usuario = this.usuarioRepository.create({
      nombre_apellido: signUpDto.nombre_apellido,
      usuario: signUpDto.usuario,
      email: signUpDto.email,
      telefono: signUpDto.telefono,
      passwordHash,
      activo: true,
    });

    const savedUser = await this.usuarioRepository.save(usuario);
    const accessToken = this.createAccessToken(savedUser);

    return {
      accessToken,
      user: this.sanitizeUser(savedUser),
    };
  }

  async signIn(signInDto: SignInDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario: signInDto.usuario },
      select: [
        'id',
        'nombre_apellido',
        'usuario',
        'email',
        'telefono',
        'activo',
        'passwordHash',
      ],
    });

    if (!usuario?.passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      usuario.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const accessToken = this.createAccessToken(usuario);

    return {
      accessToken,
      user: this.sanitizeUser(usuario),
    };
  }

  private createAccessToken(usuario: Usuario) {
    const payload = { sub: usuario.id, usuario: usuario.usuario };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(usuario: Usuario) {
    return {
      id: usuario.id,
      nombre_apellido: usuario.nombre_apellido,
      usuario: usuario.usuario,
      email: usuario.email,
      telefono: usuario.telefono,
      activo: usuario.activo,
    };
  }
}
