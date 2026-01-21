import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { DistritoLima } from '../../entities/distrito-lima.entity';
import { CreateDistritoDto } from './dto/create-distrito.dto';
import { FilterDistritosDto } from './dto/filter-distritos.dto';
import { UpdateDistritoDto } from './dto/update-distrito.dto';

@Injectable()
export class DistritosService {
  constructor(
    @InjectRepository(DistritoLima)
    private readonly distritosRepository: Repository<DistritoLima>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateDistritoDto): Promise<DistritoLima> {
    const distrito = this.distritosRepository.create({
      nombre: dto.nombre,
      ubigeo: dto.ubigeo,
      codigo_postal_ref: dto.codigo_postal_ref ?? null,
    });

    return this.distritosRepository
      .save(distrito)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterDistritosDto,
  ): Promise<{ data: DistritoLima[]; meta: { total: number; page: number; limit: number } }> {
    const query = this.distritosRepository
      .createQueryBuilder('distrito')
      .select([
        'distrito.id',
        'distrito.nombre',
        'distrito.ubigeo',
        'distrito.codigo_postal_ref',
      ])
      .orderBy('distrito.nombre', 'ASC');

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere(
        '(distrito.nombre ILIKE :keyword OR distrito.ubigeo ILIKE :keyword)',
        { keyword },
      );
    }

    const hasPagination = filters?.page !== undefined || filters?.limit !== undefined;
    const page = filters?.page ?? 1;
    const resolvedLimit = filters?.limit ?? 50;

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

  async findOne(id: number): Promise<DistritoLima> {
    const distrito = await this.distritosRepository.findOne({ where: { id } });

    if (!distrito) {
      throw new NotFoundException(`Distrito ${id} no encontrado`);
    }

    return distrito;
  }

  async update(id: number, dto: UpdateDistritoDto): Promise<DistritoLima> {
    const distrito = await this.findOne(id);

    Object.assign(distrito, {
      nombre: dto.nombre ?? distrito.nombre,
      ubigeo: dto.ubigeo ?? distrito.ubigeo,
      codigo_postal_ref: dto.codigo_postal_ref ?? distrito.codigo_postal_ref,
    });

    return this.distritosRepository
      .save(distrito)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number): Promise<void> {
    const distrito = await this.findOne(id);
    await this.distritosRepository.remove(distrito);
    await this.cacheManager.reset();
  }
}
