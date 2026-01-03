import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { Usuario } from '../../entities/usuario.entity';
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

  async create(
    dto: CreateRegistroMovilidadesDto,
    userId?: number,
  ): Promise<RegistroMovilidades> {
    const registro = this.registroRepository.create({
      fecha: dto.fecha,
      inicio: dto.inicio,
      fin: dto.fin,
      motivo: dto.motivo,
      detalle: dto.detalle,
      monto: dto.monto,
      ticket: dto.ticket,
    });
    if (userId) {
      registro.usuario = { id: userId } as Usuario;
    }

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
    userId?: number,
  ): Promise<{
    data: RegistroMovilidades[];
    meta: { total: number; page: number; limit: number };
  }> {
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
      .where('registro.usuario_id = :userId', { userId })
      .orderBy('registro.fecha', 'DESC');

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('registro.fecha BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    } else if (filters?.startDate) {
      query.andWhere('registro.fecha >= :start', { start: filters.startDate });
    } else if (filters?.endDate) {
      query.andWhere('registro.fecha <= :end', { end: filters.endDate });
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere(
        `(registro.inicio ILIKE :keyword
          OR registro.fin ILIKE :keyword
          OR registro.motivo ILIKE :keyword
          OR registro.detalle ILIKE :keyword
          OR registro.ticket ILIKE :keyword
          OR tienda.nombre_tienda ILIKE :keyword)`,
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

  async findOne(id: number, userId?: number): Promise<RegistroMovilidades> {
    const registro = await this.registroRepository.findOne({
      where: { id, usuario: { id: userId } },
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
    userId?: number,
  ): Promise<RegistroMovilidades> {
    const registro = await this.findOne(id, userId);

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

  async remove(id: number, userId?: number): Promise<void> {
    const registro = await this.findOne(id, userId);
    await this.registroRepository.remove(registro);
    await this.cacheManager.reset();
  }
}
