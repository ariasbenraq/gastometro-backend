import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Ingreso } from '../../entities/ingreso.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { Usuario } from '../../entities/usuario.entity';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateIngresoDto, userId?: number): Promise<Ingreso> {
    const ingreso = this.ingresosRepository.create({
      fecha: dto.fecha,
      monto: dto.monto,
    });

    if (userId) {
      ingreso.usuario = { id: userId } as Usuario;
    }

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
    userId?: number,
  ): Promise<{
    data: Ingreso[];
    meta: { total: number; page: number; limit: number };
  }> {
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
      .where('ingreso.usuario_id = :userId', { userId })
      .orderBy('ingreso.fecha', 'DESC');

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('ingreso.fecha BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    } else if (filters?.startDate) {
      query.andWhere('ingreso.fecha >= :start', { start: filters.startDate });
    } else if (filters?.endDate) {
      query.andWhere('ingreso.fecha <= :end', { end: filters.endDate });
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere('depositadoPor.nombre ILIKE :keyword', { keyword });
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

  async findOne(id: number, userId?: number): Promise<Ingreso> {
    const ingreso = await this.ingresosRepository.findOne({
      where: { id, usuario: { id: userId } },
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
    userId?: number,
  ): Promise<Ingreso> {
    const ingreso = await this.findOne(id, userId);

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

  async remove(id: number, userId?: number): Promise<void> {
    const ingreso = await this.findOne(id, userId);
    await this.ingresosRepository.remove(ingreso);
    await this.cacheManager.reset();
  }
}
