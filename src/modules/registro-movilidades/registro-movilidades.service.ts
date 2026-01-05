import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { Usuario } from '../../entities/usuario.entity';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { FilterRegistroMovilidadesDto } from './dto/filter-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';

@Injectable()
export class RegistroMovilidadesService {
  constructor(
    @InjectRepository(RegistroMovilidades)
    private readonly registroRepository: Repository<RegistroMovilidades>,
    @InjectRepository(TiendaIbk)
    private readonly tiendaRepository: Repository<TiendaIbk>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  private formatDate(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private resolveTargetUserId(
    currentUser?: AuthenticatedUser,
    requestedUserId?: number,
  ) {
    if (currentUser?.rol === UserRole.USER) {
      return currentUser.userId;
    }

    if (!requestedUserId) {
      throw new BadRequestException(
        'Debe especificar el usuario para registrar la movilidad.',
      );
    }

    return requestedUserId;
  }

  private resolveFilterUserId(
    currentUser?: AuthenticatedUser,
    requestedUserId?: number,
  ) {
    if (currentUser?.rol === UserRole.USER) {
      return currentUser.userId;
    }
    return requestedUserId;
  }

  private resolveOwnershipUserId(currentUser?: AuthenticatedUser) {
    if (currentUser?.rol === UserRole.USER) {
      return currentUser.userId;
    }
    return undefined;
  }

  private resolveDateRange(filters?: FilterRegistroMovilidadesDto) {
    if (!filters) {
      return {};
    }

    if (filters.from || filters.to) {
      return { startDate: filters.from, endDate: filters.to };
    }

    if (filters.month !== undefined) {
      if (!filters.year) {
        throw new BadRequestException(
          'El año es obligatorio cuando se especifica el mes.',
        );
      }
      const start = new Date(Date.UTC(filters.year, filters.month - 1, 1));
      const end = new Date(Date.UTC(filters.year, filters.month, 0));
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
      };
    }

    if (filters.year) {
      const start = new Date(Date.UTC(filters.year, 0, 1));
      const end = new Date(Date.UTC(filters.year, 11, 31));
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
      };
    }

    return {};
  }

  async create(
    dto: CreateRegistroMovilidadesDto,
    currentUser?: AuthenticatedUser,
  ): Promise<RegistroMovilidades> {
    const userId = this.resolveTargetUserId(currentUser, dto.userId);
    const registro = this.registroRepository.create({
      fecha: dto.fecha,
      inicio: dto.inicio,
      fin: dto.fin,
      motivo: dto.motivo,
      detalle: dto.detalle,
      monto: dto.monto,
      ticket: dto.ticket,
    });
    registro.usuario = { id: userId } as Usuario;

    if (dto.tiendaId) {
      const tienda = await this.tiendaRepository.findOne({
        where: { id: dto.tiendaId },
      });
      registro.tienda = tienda ?? undefined;
    }

    return this.registroRepository
      .save(registro)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterRegistroMovilidadesDto,
    currentUser?: AuthenticatedUser,
  ): Promise<{
    data: RegistroMovilidades[];
    meta: { total: number; page: number; limit: number };
  }> {
    const userId = this.resolveFilterUserId(currentUser, filters?.userId);
    const { startDate, endDate } = this.resolveDateRange(filters);
    const query = this.registroRepository
      .createQueryBuilder('registro')
      .leftJoin('registro.tienda', 'tienda')
      .select([
        'registro.id',
        'registro.fecha',
        'registro.inicio',
        'registro.fin',
        'registro.motivo',
        'registro.detalle',
        'registro.monto',
        'registro.ticket',
        'tienda.id',
        'tienda.codigo_tienda',
        'tienda.nombre_tienda',
      ])
      .orderBy('registro.fecha', 'DESC');
    let hasWhere = false;

    if (userId) {
      query.where('registro.usuario_id = :userId', { userId });
      hasWhere = true;
    }

    if (startDate && endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
      hasWhere = true;
    } else if (startDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha >= :start', { start: startDate });
      hasWhere = true;
    } else if (endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha <= :end', { end: endDate });
      hasWhere = true;
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      const method = hasWhere ? 'andWhere' : 'where';
      query[method](
        `(registro.inicio ILIKE :keyword
          OR registro.fin ILIKE :keyword
          OR registro.motivo ILIKE :keyword
          OR registro.detalle ILIKE :keyword
          OR registro.ticket ILIKE :keyword
          OR tienda.nombre_tienda ILIKE :keyword)`,
        { keyword },
      );
      hasWhere = true;
    }

    const hasPagination = filters?.page !== undefined || filters?.limit !== undefined;
    const page = filters?.page ?? 1;
    const resolvedLimit = filters?.limit ?? 20;

    if (hasPagination) {
      query.take(resolvedLimit).skip((page - 1) * resolvedLimit);
    }

    const [data, total] = await query.getManyAndCount();
    const limit = hasPagination ? resolvedLimit : total;
    const resolvedPage = hasPagination ? page : 1;

    return {
      data,
      meta: {
        total,
        page: resolvedPage,
        limit,
      },
    };
  }

  async findOne(
    id: number,
    currentUser?: AuthenticatedUser,
  ): Promise<RegistroMovilidades> {
    const userId = this.resolveOwnershipUserId(currentUser);
    const whereClause = userId
      ? { id, usuario: { id: userId } }
      : { id };
    const registro = await this.registroRepository.findOne({
      where: whereClause,
      relations: ['tienda'],
    });

    if (!registro) {
      throw new NotFoundException(`Registro movilidad ${id} no encontrado`);
    }

    return registro;
  }

  async update(
    id: number,
    dto: UpdateRegistroMovilidadesDto,
    currentUser?: AuthenticatedUser,
  ): Promise<RegistroMovilidades> {
    const registro = await this.findOne(id, currentUser);

    if (dto.tiendaId !== undefined) {
      if (dto.tiendaId) {
        const tienda = await this.tiendaRepository.findOne({
          where: { id: dto.tiendaId },
        });
        registro.tienda = tienda ?? undefined;
      } else {
        registro.tienda = undefined;
      }
    }

    Object.assign(registro, {
      fecha: dto.fecha ?? registro.fecha,
      inicio: dto.inicio ?? registro.inicio,
      fin: dto.fin ?? registro.fin,
      motivo: dto.motivo ?? registro.motivo,
      detalle: dto.detalle ?? registro.detalle,
      monto: dto.monto ?? registro.monto,
      ticket: dto.ticket ?? registro.ticket,
    });

    return this.registroRepository
      .save(registro)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number, currentUser?: AuthenticatedUser): Promise<void> {
    const registro = await this.findOne(id, currentUser);
    await this.registroRepository.remove(registro);
    await this.cacheManager.reset();
  }
}
