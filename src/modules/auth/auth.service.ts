import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomInt } from 'crypto';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { Usuario } from '../../entities/usuario.entity';
import { MailerService } from '../mailer/mailer.service';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { VerifyPasswordResetDto } from './dto/verify-password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    if (signUpDto.usuario.toLowerCase() === 'admin') {
      throw new ConflictException('El usuario ya existe.');
    }

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
    return this.issueTokens(savedUser);
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

    return this.issueTokens(usuario);
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { tokenId, tokenSecret } = this.parseRefreshToken(
      refreshTokenDto.refreshToken,
    );

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { id: tokenId },
      relations: ['usuario'],
    });

    if (!storedToken || storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    if (storedToken.expiresAt < new Date()) {
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);
      throw new UnauthorizedException('Refresh token expirado.');
    }

    const idleTimeoutMinutes = Number(
      this.configService.get('JWT_IDLE_TIMEOUT_MINUTES') ?? 60,
    );
    const idleLimit = new Date(
      storedToken.lastUsedAt.getTime() + idleTimeoutMinutes * 60 * 1000,
    );

    if (idleLimit < new Date()) {
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);
      throw new UnauthorizedException('Sesión inactiva.');
    }

    const isTokenValid = await bcrypt.compare(
      tokenSecret,
      storedToken.tokenHash,
    );

    if (!isTokenValid) {
      storedToken.revokedAt = new Date();
      await this.refreshTokenRepository.save(storedToken);
      throw new UnauthorizedException('Refresh token inválido.');
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);

    return this.issueTokens(storedToken.usuario);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: dto.email },
    });

    if (!usuario) {
      return {
        message:
          'Si el correo existe, se enviará un código de recuperación.',
      };
    }

    const now = new Date();
    await this.passwordResetTokenRepository.update(
      {
        usuario: { id: usuario.id },
        usedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      { usedAt: now },
    );

    const code = this.generateResetCode();
    const tokenHash = await bcrypt.hash(
      code,
      Number(this.configService.get('BCRYPT_SALT_ROUNDS') ?? 10),
    );

    const ttlMinutes = Number(
      this.configService.get('PASSWORD_RESET_CODE_TTL_MINUTES') ?? 15,
    );
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

    const token = this.passwordResetTokenRepository.create({
      usuario,
      tokenHash,
      expiresAt,
    });

    await this.passwordResetTokenRepository.save(token);
    await this.mailerService.sendPasswordResetCode(usuario.email, code);

    return {
      message: 'Si el correo existe, se enviará un código de recuperación.',
    };
  }

  async verifyPasswordReset(dto: VerifyPasswordResetDto) {
    const token = await this.findValidResetToken(dto.email);

    if (!token?.tokenHash) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const isValid = await bcrypt.compare(dto.code, token.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    return { valid: true };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    const token = await this.findValidResetToken(dto.email);

    if (!token?.tokenHash) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const isValid = await bcrypt.compare(dto.code, token.tokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'passwordHash'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Código inválido o expirado.');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') ?? 10);
    usuario.passwordHash = await bcrypt.hash(dto.password, saltRounds);
    await this.usuarioRepository.save(usuario);

    const now = new Date();
    token.usedAt = now;
    await this.passwordResetTokenRepository.save(token);

    await this.refreshTokenRepository.update(
      {
        usuario: { id: usuario.id },
        revokedAt: IsNull(),
        expiresAt: MoreThan(now),
      },
      { revokedAt: now },
    );

    return { message: 'Contraseña actualizada.' };
  }

  private async issueTokens(usuario: Usuario) {
    const accessToken = this.createAccessToken(usuario);
    const refreshToken = await this.createRefreshToken(usuario);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(usuario),
    };
  }

  private createAccessToken(usuario: Usuario) {
    const payload = { sub: usuario.id, usuario: usuario.usuario };
    return this.jwtService.sign(payload);
  }

  private async createRefreshToken(usuario: Usuario) {
    const tokenSecret = randomBytes(48).toString('base64url');
    const tokenHash = await bcrypt.hash(
      tokenSecret,
      Number(this.configService.get('BCRYPT_SALT_ROUNDS') ?? 10),
    );

    const expiresInDays = Number(
      this.configService.get('JWT_REFRESH_EXPIRES_IN_DAYS') ?? 7,
    );
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    const refreshToken = this.refreshTokenRepository.create({
      usuario,
      tokenHash,
      expiresAt,
      lastUsedAt: now,
    });

    const savedToken = await this.refreshTokenRepository.save(refreshToken);

    return `${savedToken.id}.${tokenSecret}`;
  }

  private parseRefreshToken(refreshToken: string) {
    const [tokenIdRaw, tokenSecret] = refreshToken.split('.');
    const tokenId = Number(tokenIdRaw);

    if (!tokenId || !tokenSecret) {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    return { tokenId, tokenSecret };
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

  private generateResetCode() {
    return String(randomInt(100000, 1000000));
  }

  private async findValidResetToken(email: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      select: ['id', 'email'],
    });

    if (!usuario) {
      return null;
    }

    const now = new Date();
    return this.passwordResetTokenRepository
      .createQueryBuilder('token')
      .addSelect('token.tokenHash')
      .where('token.usuario_id = :userId', { userId: usuario.id })
      .andWhere('token.used_at IS NULL')
      .andWhere('token.expires_at > :now', { now })
      .orderBy('token.created_at', 'DESC')
      .getOne();
  }
}
