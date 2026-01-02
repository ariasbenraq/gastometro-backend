import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { EstadoServicio } from '../../entities/estado-servicio.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { CreateTiendaIbkDto } from './dto/create-tienda-ibk.dto';
import { FilterTiendasIbkDto } from './dto/filter-tiendas-ibk.dto';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { UpdateTiendaIbkDto } from './dto/update-tienda-ibk.dto';

@Injectable()
export class TiendasIbkService {
  constructor(
    @InjectRepository(TiendaIbk)
    private readonly tiendasRepository: Repository<TiendaIbk>,
    @InjectRepository(EstadoServicio)
    private readonly estadoServicioRepository: Repository<EstadoServicio>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateTiendaIbkDto): Promise<TiendaIbk> {
    const tienda = this.tiendasRepository.create({
      codigo_tienda: dto.codigo_tienda,
      nombre_tienda: dto.nombre_tienda,
      distrito: dto.distrito,
      provincia: dto.provincia,
      departamento: dto.departamento,
    });

    if (dto.estadoServicioId) {
      const estadoServicio = await this.estadoServicioRepository.findOne({
        where: { id: dto.estadoServicioId },
      });
      tienda.estadoServicio = estadoServicio ?? undefined;
    }

    return this.tiendasRepository
      .save(tienda)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterTiendasIbkDto,
  ): Promise<{ data: TiendaIbk[]; meta: { total: number; page: number; limit: number } }> {
    const query = this.tiendasRepository
      .createQueryBuilder('tienda')
      .leftJoin('tienda.estadoServicio', 'estadoServicio')
      .select([
        'tienda.id',
        'tienda.codigo_tienda',
        'tienda.nombre_tienda',
        'tienda.distrito',
        'tienda.provincia',
        'tienda.departamento',
        'estadoServicio.id',
        'estadoServicio.estado',
      ])
      .orderBy('tienda.nombre_tienda', 'ASC');

    if (filters?.estadoServicioId) {
      query.andWhere('estadoServicio.id = :estadoServicioId', {
        estadoServicioId: filters.estadoServicioId,
      });
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere(
        `(tienda.codigo_tienda ILIKE :keyword
          OR tienda.nombre_tienda ILIKE :keyword
          OR tienda.distrito ILIKE :keyword
          OR tienda.provincia ILIKE :keyword
          OR tienda.departamento ILIKE :keyword)`,
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

  async findOne(id: number): Promise<TiendaIbk> {
    const tienda = await this.tiendasRepository.findOne({
      where: { id },
      relations: ['estadoServicio'],
    });

    if (!tienda) {
      throw new NotFoundException(`Tienda ${id} no encontrada`);
    }

    return tienda;
  }

  async update(id: number, dto: UpdateTiendaIbkDto): Promise<TiendaIbk> {
    const tienda = await this.findOne(id);

    if (dto.estadoServicioId !== undefined) {
      if (dto.estadoServicioId) {
        const estadoServicio = await this.estadoServicioRepository.findOne({
          where: { id: dto.estadoServicioId },
        });
        tienda.estadoServicio = estadoServicio ?? undefined;
      } else {
        tienda.estadoServicio = undefined;
      }
    }

    Object.assign(tienda, {
      codigo_tienda: dto.codigo_tienda ?? tienda.codigo_tienda,
      nombre_tienda: dto.nombre_tienda ?? tienda.nombre_tienda,
      distrito: dto.distrito ?? tienda.distrito,
      provincia: dto.provincia ?? tienda.provincia,
      departamento: dto.departamento ?? tienda.departamento,
    });

    return this.tiendasRepository
      .save(tienda)
      .finally(() => this.cacheManager.reset());
  }

  async updateEstadoServicio(
    id: number,
    dto: UpdateEstadoServicioDto,
  ): Promise<TiendaIbk> {
    const tienda = await this.findOne(id);

    if (dto.estadoServicioId) {
      const estadoServicio = await this.estadoServicioRepository.findOne({
        where: { id: dto.estadoServicioId },
      });
      tienda.estadoServicio = estadoServicio ?? undefined;
    } else {
      tienda.estadoServicio = undefined;
    }

    return this.tiendasRepository
      .save(tienda)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number): Promise<void> {
    const tienda = await this.findOne(id);
    await this.tiendasRepository.remove(tienda);
    await this.cacheManager.reset();
  }
}
