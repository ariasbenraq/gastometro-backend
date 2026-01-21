import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { DistritoLima } from '../../entities/distrito-lima.entity';
import { EntidadFinanciera } from '../../entities/entidad-financiera.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { Usuario } from '../../entities/usuario.entity';
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { FilterRegistroMovilidadesDto } from './dto/filter-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';

@Injectable()
export class RegistroMovilidadesService {
  constructor(
    @InjectRepository(RegistroMovilidades)
    private readonly registroRepository: Repository<RegistroMovilidades>,
    @InjectRepository(DistritoLima)
    private readonly distritoRepository: Repository<DistritoLima>,
    @InjectRepository(EntidadFinanciera)
    private readonly clienteRepository: Repository<EntidadFinanciera>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async create(
    dto: CreateRegistroMovilidadesDto,
    userId?: number,
  ): Promise<RegistroMovilidades> {
    const registro = this.registroRepository.create({
      fecha: dto.fecha,
      motivo: dto.motivo,
      detalle: dto.detalle,
      monto: dto.monto,
      wo: dto.wo,
    });
    if (userId) {
      registro.usuario = { id: userId } as Usuario;
    }

    const [inicioDistrito, finDistrito, cliente] = await Promise.all([
      this.distritoRepository.findOne({ where: { id: dto.inicioId } }),
      this.distritoRepository.findOne({ where: { id: dto.finId } }),
      this.clienteRepository.findOne({ where: { id: dto.clienteId } }),
    ]);

    if (!inicioDistrito) {
      throw new NotFoundException(
        `Distrito de inicio ${dto.inicioId} no encontrado`,
      );
    }

    if (!finDistrito) {
      throw new NotFoundException(
        `Distrito de fin ${dto.finId} no encontrado`,
      );
    }

    if (!cliente) {
      throw new NotFoundException(`Cliente ${dto.clienteId} no encontrado`);
    }

    registro.inicio = inicioDistrito;
    registro.fin = finDistrito;
    registro.cliente = cliente;

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
      .leftJoin('registro.inicio', 'inicio')
      .leftJoin('registro.fin', 'fin')
      .leftJoin('registro.cliente', 'cliente')
      .select([
        'registro.id',
        'registro.fecha',
        'registro.motivo',
        'registro.detalle',
        'registro.monto',
        'registro.wo',
        'inicio.id',
        'inicio.nombre',
        'fin.id',
        'fin.nombre',
        'cliente.id',
        'cliente.nombre',
        'cliente.tipo',
      ])
      .orderBy('registro.fecha', 'DESC');
    let hasWhere = false;

    if (userId) {
      query.where('registro.usuario_id = :userId', { userId });
      hasWhere = true;
    }

    if (filters?.startDate && filters?.endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
      hasWhere = true;
    } else if (filters?.startDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha >= :start', { start: filters.startDate });
      hasWhere = true;
    } else if (filters?.endDate) {
      const method = hasWhere ? 'andWhere' : 'where';
      query[method]('registro.fecha <= :end', { end: filters.endDate });
      hasWhere = true;
    }

    if (filters?.q?.trim()) {
      const keyword = `%${filters.q.trim()}%`;
      const method = hasWhere ? 'andWhere' : 'where';
      query[method](
        `(inicio.nombre ILIKE :keyword
          OR fin.nombre ILIKE :keyword
          OR registro.motivo ILIKE :keyword
          OR registro.detalle ILIKE :keyword
          OR registro.wo ILIKE :keyword
          OR cliente.nombre ILIKE :keyword)`,
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

  async findOne(id: number, userId?: number): Promise<RegistroMovilidades> {
    const whereClause = userId
      ? { id, usuario: { id: userId } }
      : { id };
    const registro = await this.registroRepository.findOne({
      where: whereClause,
      relations: ['inicio', 'fin', 'cliente'],
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

    if (dto.inicioId !== undefined) {
      const inicioDistrito = await this.distritoRepository.findOne({
        where: { id: dto.inicioId },
      });
      if (!inicioDistrito) {
        throw new NotFoundException(
          `Distrito de inicio ${dto.inicioId} no encontrado`,
        );
      }
      registro.inicio = inicioDistrito;
    }

    if (dto.finId !== undefined) {
      const finDistrito = await this.distritoRepository.findOne({
        where: { id: dto.finId },
      });
      if (!finDistrito) {
        throw new NotFoundException(
          `Distrito de fin ${dto.finId} no encontrado`,
        );
      }
      registro.fin = finDistrito;
    }

    if (dto.clienteId !== undefined) {
      const cliente = await this.clienteRepository.findOne({
        where: { id: dto.clienteId },
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente ${dto.clienteId} no encontrado`);
      }
      registro.cliente = cliente;
    }

    Object.assign(registro, {
      fecha: dto.fecha ?? registro.fecha,
      motivo: dto.motivo ?? registro.motivo,
      detalle: dto.detalle ?? registro.detalle,
      monto: dto.monto ?? registro.monto,
      wo: dto.wo ?? registro.wo,
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
