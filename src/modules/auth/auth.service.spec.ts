import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { Usuario } from '../../entities/usuario.entity';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepository: jest.Mocked<Repository<Usuario>>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    usuarioRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<Usuario>>;

    refreshTokenRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<RefreshToken>>;

    jwtService = { sign: jest.fn() } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(
      usuarioRepository,
      refreshTokenRepository,
      jwtService,
      configService,
    );
  });

  it('throws conflict when usuario already exists', async () => {
    const dto: SignUpDto = {
      nombre_apellido: 'Juan Perez',
      usuario: 'juan',
      email: 'juan@example.com',
      telefono: '123',
      password: 'secret',
    };

    usuarioRepository.findOne.mockResolvedValue({
      usuario: 'juan',
      email: 'otro@example.com',
    } as Usuario);

    await expect(service.signUp(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws conflict when email already exists', async () => {
    const dto: SignUpDto = {
      nombre_apellido: 'Juan Perez',
      usuario: 'juan',
      email: 'juan@example.com',
      telefono: '123',
      password: 'secret',
    };

    usuarioRepository.findOne.mockResolvedValue({
      usuario: 'otro',
      email: 'juan@example.com',
    } as Usuario);

    await expect(service.signUp(dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('creates tokens and sanitizes user on signUp', async () => {
    const dto: SignUpDto = {
      nombre_apellido: 'Ana Soto',
      usuario: 'ana',
      email: 'ana@example.com',
      telefono: '987',
      password: 'secret',
    };

    const savedUser: Usuario = {
      id: 1,
      nombre_apellido: 'Ana Soto',
      usuario: 'ana',
      email: 'ana@example.com',
      telefono: '987',
      activo: true,
    } as Usuario;

    usuarioRepository.findOne.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    usuarioRepository.create.mockReturnValue(savedUser);
    usuarioRepository.save.mockResolvedValue(savedUser);
    refreshTokenRepository.create.mockImplementation((token) => token as RefreshToken);
    refreshTokenRepository.save.mockResolvedValue({ id: 5 } as RefreshToken);
    jwtService.sign.mockReturnValue('access-token');
    configService.get.mockImplementation((key: string) => {
      if (key === 'BCRYPT_SALT_ROUNDS') {
        return 10;
      }
      if (key === 'JWT_REFRESH_EXPIRES_IN_DAYS') {
        return 7;
      }
      return undefined;
    });

    const result = await service.signUp(dto);

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toMatch(/^5\./);
    expect(result.user).toEqual({
      id: 1,
      nombre_apellido: 'Ana Soto',
      usuario: 'ana',
      email: 'ana@example.com',
      telefono: '987',
      activo: true,
    });
  });

  it('throws unauthorized on invalid credentials in signIn', async () => {
    const dto: SignInDto = {
      usuario: 'ana',
      password: 'bad',
    };

    usuarioRepository.findOne.mockResolvedValue({
      id: 1,
      usuario: 'ana',
      passwordHash: 'hash',
    } as Usuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.signIn(dto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
