import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { CreateGastoDto } from './dto/create-gasto.dto';
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

  async create(dto: CreateGastoDto): Promise<Gasto> {
    const gasto = this.gastosRepository.create({
      fecha: dto.fecha,
      item: dto.item,
      motivo: dto.motivo,
      monto: dto.monto,
    });

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

  findAll(): Promise<Gasto[]> {
    return this.gastosRepository.find({
      relations: ['aprobadoPor'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Gasto> {
    const gasto = await this.gastosRepository.findOne({
      where: { id },
      relations: ['aprobadoPor'],
    });

    if (!gasto) {
      throw new NotFoundException(`Gasto ${id} no encontrado`);
    }

    return gasto;
  }

  async update(id: number, dto: UpdateGastoDto): Promise<Gasto> {
    const gasto = await this.findOne(id);

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

  async remove(id: number): Promise<void> {
    const gasto = await this.findOne(id);
    await this.gastosRepository.remove(gasto);
    await this.cacheManager.reset();
  }
}
