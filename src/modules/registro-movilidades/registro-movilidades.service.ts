import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
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

  async create(dto: CreateRegistroMovilidadesDto): Promise<RegistroMovilidades> {
    const registro = this.registroRepository.create({
      fecha: dto.fecha,
      inicio: dto.inicio,
      fin: dto.fin,
      motivo: dto.motivo,
      detalle: dto.detalle,
      monto: dto.monto,
      ticket: dto.ticket,
    });

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

  findAll(filters?: FilterRegistroMovilidadesDto): Promise<RegistroMovilidades[]> {
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

    return query.getMany();
  }

  async findOne(id: number): Promise<RegistroMovilidades> {
    const registro = await this.registroRepository.findOne({
      where: { id },
      relations: ['tienda'],
    });

    if (!registro) {
      throw new NotFoundException(`Registro movilidad ${id} no encontrado`);
    }

    return registro;
  }

  async update(id: number, dto: UpdateRegistroMovilidadesDto): Promise<RegistroMovilidades> {
    const registro = await this.findOne(id);

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

  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.registroRepository.remove(registro);
    await this.cacheManager.reset();
  }
}
