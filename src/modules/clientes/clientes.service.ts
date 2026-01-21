import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { EntidadFinanciera } from '../../entities/entidad-financiera.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { FilterClientesDto } from './dto/filter-clientes.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(EntidadFinanciera)
    private readonly clientesRepository: Repository<EntidadFinanciera>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(dto: CreateClienteDto): Promise<EntidadFinanciera> {
    const cliente = this.clientesRepository.create({
      nombre: dto.nombre,
      tipo: dto.tipo,
    });

    return this.clientesRepository
      .save(cliente)
      .finally(() => this.cacheManager.reset());
  }

  async findAll(
    filters?: FilterClientesDto,
  ): Promise<{ data: EntidadFinanciera[]; meta: { total: number; page: number; limit: number } }> {
    const query = this.clientesRepository
      .createQueryBuilder('cliente')
      .select(['cliente.id', 'cliente.nombre', 'cliente.tipo'])
      .orderBy('cliente.nombre', 'ASC');

    if (filters?.tipo?.trim()) {
      query.andWhere('cliente.tipo ILIKE :tipo', {
        tipo: `%${filters.tipo.trim()}%`,
      });
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      query.andWhere(
        '(cliente.nombre ILIKE :keyword OR cliente.tipo ILIKE :keyword)',
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

  async findOne(id: number): Promise<EntidadFinanciera> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });

    if (!cliente) {
      throw new NotFoundException(`Cliente ${id} no encontrado`);
    }

    return cliente;
  }

  async update(id: number, dto: UpdateClienteDto): Promise<EntidadFinanciera> {
    const cliente = await this.findOne(id);

    Object.assign(cliente, {
      nombre: dto.nombre ?? cliente.nombre,
      tipo: dto.tipo ?? cliente.tipo,
    });

    return this.clientesRepository
      .save(cliente)
      .finally(() => this.cacheManager.reset());
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clientesRepository.remove(cliente);
    await this.cacheManager.reset();
  }
}
