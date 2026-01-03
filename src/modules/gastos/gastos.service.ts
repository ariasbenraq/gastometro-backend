import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { Usuario } from '../../entities/usuario.entity';
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

  async create(dto: CreateGastoDto, userId?: number): Promise<Gasto> {
    const gasto = this.gastosRepository.create({
      fecha: dto.fecha,
      item: dto.item,
      motivo: dto.motivo,
      monto: dto.monto,
    });

    if (userId) {
      gasto.usuario = { id: userId } as Usuario;
    }

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
    userId?: number,
  ): Promise<{ data: Gasto[]; meta: { total: number; page: number; limit: number } }> {
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
      .where('gasto.usuario_id = :userId', { userId })
      .orderBy('gasto.fecha', 'DESC');

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('gasto.fecha BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    } else if (filters?.startDate) {
      query.andWhere('gasto.fecha >= :start', { start: filters.startDate });
    } else if (filters?.endDate) {
      query.andWhere('gasto.fecha <= :end', { end: filters.endDate });
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere(
        '(gasto.item ILIKE :keyword OR gasto.motivo ILIKE :keyword OR aprobadoPor.nombre ILIKE :keyword)',
        { keyword },
      );
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

  async findOne(id: number, userId?: number): Promise<Gasto> {
    const gasto = await this.gastosRepository.findOne({
      where: { id, usuario: { id: userId } },
      relations: ['aprobadoPor'],
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto ${id} no encontrado`);
    }

    return gasto;
  }

  async update(id: number, dto: UpdateGastoDto, userId?: number): Promise<Gasto> {
    const gasto = await this.findOne(id, userId);

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

  async remove(id: number, userId?: number): Promise<void> {
    const gasto = await this.findOne(id, userId);
    await this.gastosRepository.remove(gasto);
    await this.cacheManager.reset();
  }
}
