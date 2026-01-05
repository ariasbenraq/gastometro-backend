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
import { Gasto } from '../../entities/gasto.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { Usuario } from '../../entities/usuario.entity';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { FilterGastosDto } from './dto/filter-gastos.dto';
import { UpdateGastoDto } from './dto/update-gasto.dto';

@Injectable()
export class GastosService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
    @InjectRepository(PersonalAdministrativo)
    private readonly personalRepository: Repository<PersonalAdministrativo>,
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
        'Debe especificar el usuario para registrar el gasto.',
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

  private resolveDateRange(filters?: FilterGastosDto) {
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

  async create(dto: CreateGastoDto, currentUser?: AuthenticatedUser): Promise<Gasto> {
    const userId = this.resolveTargetUserId(currentUser, dto.userId);
    const gasto = this.gastosRepository.create({
      fecha: dto.fecha,
      item: dto.item,
      motivo: dto.motivo,
      monto: dto.monto,
    });

    gasto.usuario = { id: userId } as Usuario;

    if (dto.aprobadoPorId) {
      const aprobadoPor = await this.personalRepository.findOne({
        where: { id: dto.aprobadoPorId },
      });
      gasto.aprobadoPor = aprobadoPor ?? undefined;
    }

    return this.gastosRepository
      .save(gasto)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterGastosDto,
    currentUser?: AuthenticatedUser,
  ): Promise<{ data: Gasto[]; meta: { total: number; page: number; limit: number } }> {
    const userId = this.resolveFilterUserId(currentUser, filters?.userId);
    const { startDate, endDate } = this.resolveDateRange(filters);
    const query = this.gastosRepository
      .createQueryBuilder('gasto')
      .leftJoin('gasto.aprobadoPor', 'aprobadoPor')
      .select([
        'gasto.id',
        'gasto.fecha',
        'gasto.item',
        'gasto.motivo',
        'gasto.monto',
        'aprobadoPor.id',
        'aprobadoPor.nombre',
      ])
      .orderBy('gasto.fecha', 'DESC');
    let hasWhere = false;

    if (userId) {
      query.where('gasto.usuario_id = :userId', { userId });
      hasWhere = true;
    }

    if (startDate && endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('gasto.fecha BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
      hasWhere = true;
    } else if (startDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('gasto.fecha >= :start', { start: startDate });
      hasWhere = true;
    } else if (endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('gasto.fecha <= :end', { end: endDate });
      hasWhere = true;
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      const method = hasWhere ? 'andWhere' : 'where';
      query[method](
        '(gasto.item ILIKE :keyword OR gasto.motivo ILIKE :keyword OR aprobadoPor.nombre ILIKE :keyword)',
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

  async findOne(id: number, currentUser?: AuthenticatedUser): Promise<Gasto> {
    const userId = this.resolveOwnershipUserId(currentUser);
    const whereClause = userId
      ? { id, usuario: { id: userId } }
      : { id };
    const gasto = await this.gastosRepository.findOne({
      where: whereClause,
      relations: ['aprobadoPor'],
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto ${id} no encontrado`);
    }

    return gasto;
  }

  async update(
    id: number,
    dto: UpdateGastoDto,
    currentUser?: AuthenticatedUser,
  ): Promise<Gasto> {
    const gasto = await this.findOne(id, currentUser);

    if (dto.aprobadoPorId !== undefined) {
      if (dto.aprobadoPorId) {
        const aprobadoPor = await this.personalRepository.findOne({
          where: { id: dto.aprobadoPorId },
        });
        gasto.aprobadoPor = aprobadoPor ?? undefined;
      } else {
        gasto.aprobadoPor = undefined;
      }
    }

    Object.assign(gasto, {
      fecha: dto.fecha ?? gasto.fecha,
      item: dto.item ?? gasto.item,
      motivo: dto.motivo ?? gasto.motivo,
      monto: dto.monto ?? gasto.monto,
    });

    return this.gastosRepository
      .save(gasto)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number, currentUser?: AuthenticatedUser): Promise<void> {
    const gasto = await this.findOne(id, currentUser);
    await this.gastosRepository.remove(gasto);
    await this.cacheManager.reset();
  }
}
