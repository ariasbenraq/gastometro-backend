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
import { Ingreso } from '../../entities/ingreso.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { Usuario } from '../../entities/usuario.entity';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { FilterIngresosDto } from './dto/filter-ingresos.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresosRepository: Repository<Ingreso>,
    @InjectRepository(PersonalAdministrativo)
    private readonly personalRepository: Repository<PersonalAdministrativo>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
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
        'Debe especificar el usuario para registrar el ingreso.',
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

  private resolveDateRange(filters?: FilterIngresosDto) {
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

  async create(dto: CreateIngresoDto, currentUser?: AuthenticatedUser): Promise<Ingreso> {
    const userId = this.resolveTargetUserId(currentUser, dto.usuarioId);

    const usuario = await this.usuariosRepository.findOne({
      where: { id: userId },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`);
    }

    const ingreso = this.ingresosRepository.create({
      fecha: dto.fecha,
      monto: dto.monto,
    });

    ingreso.usuario = usuario;

    if (dto.depositadoPorId) {
      const depositadoPor = await this.personalRepository.findOne({
        where: { id: dto.depositadoPorId },
      });
      ingreso.depositadoPor = depositadoPor ?? undefined;
    }

    return this.ingresosRepository
      .save(ingreso)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterIngresosDto,
    currentUser?: AuthenticatedUser,
  ): Promise<{
    data: Ingreso[];
    meta: { total: number; page: number; limit: number };
  }> {
    const userId = this.resolveFilterUserId(currentUser, filters?.userId);
    const { startDate, endDate } = this.resolveDateRange(filters);
    const query = this.ingresosRepository
      .createQueryBuilder('ingreso')
      .leftJoin('ingreso.depositadoPor', 'depositadoPor')
      .select([
        'ingreso.id',
        'ingreso.fecha',
        'ingreso.monto',
        'depositadoPor.id',
        'depositadoPor.nombre',
      ])
      .orderBy('ingreso.fecha', 'DESC');
    let hasWhere = false;

    if (userId) {
      query.where('ingreso.usuario_id = :userId', { userId });
      hasWhere = true;
    }

    if (startDate && endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('ingreso.fecha BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      });
      hasWhere = true;
    } else if (startDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('ingreso.fecha >= :start', { start: startDate });
      hasWhere = true;
    } else if (endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('ingreso.fecha <= :end', { end: endDate });
      hasWhere = true;
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('depositadoPor.nombre ILIKE :keyword', { keyword });
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

  async findOne(id: number, currentUser?: AuthenticatedUser): Promise<Ingreso> {
    const userId = this.resolveOwnershipUserId(currentUser);
    const whereClause = userId
      ? { id, usuario: { id: userId } }
      : { id };
    const ingreso = await this.ingresosRepository.findOne({
      where: whereClause,
      relations: ['depositadoPor'],
    });

    if (!ingreso) {
      throw new NotFoundException(`Ingreso ${id} no encontrado`);
    }

    return ingreso;
  }

  async update(
    id: number,
    dto: UpdateIngresoDto,
    currentUser?: AuthenticatedUser,
  ): Promise<Ingreso> {
    const ingreso = await this.findOne(id, currentUser);

    if (dto.depositadoPorId !== undefined) {
      if (dto.depositadoPorId) {
        const depositadoPor = await this.personalRepository.findOne({
          where: { id: dto.depositadoPorId },
        });
        ingreso.depositadoPor = depositadoPor ?? undefined;
      } else {
        ingreso.depositadoPor = undefined;
      }
    }

    Object.assign(ingreso, {
      fecha: dto.fecha ?? ingreso.fecha,
      monto: dto.monto ?? ingreso.monto,
    });

    return this.ingresosRepository
      .save(ingreso)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number, currentUser?: AuthenticatedUser): Promise<void> {
    const ingreso = await this.findOne(id, currentUser);
    await this.ingresosRepository.remove(ingreso);
    await this.cacheManager.reset();
  }
}
