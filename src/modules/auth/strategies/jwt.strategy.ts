import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../../entities/usuario.entity';

interface JwtPayload {
  sub: number;
  usuario: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'changeme',
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
    });

    if (!usuario) {
      throw new UnauthorizedException();
    }

    return { userId: usuario.id, usuario: usuario.usuario };
  }
}
