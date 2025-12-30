import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingreso } from '../../entities/ingreso.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { CreateIngresoDto } from './dto/create-ingreso.dto';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresosRepository: Repository<Ingreso>,
    @InjectRepository(PersonalAdministrativo)
    private readonly personalRepository: Repository<PersonalAdministrativo>,
  ) {}

  async create(dto: CreateIngresoDto): Promise<Ingreso> {
    const ingreso = this.ingresosRepository.create({
      fecha: dto.fecha,
      monto: dto.monto,
    });

    if (dto.depositadoPorId) {
      const depositadoPor = await this.personalRepository.findOne({
        where: { id: dto.depositadoPorId },
      });
      ingreso.depositadoPor = depositadoPor ?? undefined;
    }

    return this.ingresosRepository.save(ingreso);
  }

  findAll(): Promise<Ingreso[]> {
    return this.ingresosRepository.find({
      relations: ['depositadoPor'],
      order: { fecha: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Ingreso> {
    const ingreso = await this.ingresosRepository.findOne({
      where: { id },
      relations: ['depositadoPor'],
    });

    if (!ingreso) {
      throw new NotFoundException(`Ingreso ${id} no encontrado`);
    }

    return ingreso;
  }

  async update(id: number, dto: UpdateIngresoDto): Promise<Ingreso> {
    const ingreso = await this.findOne(id);

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

    return this.ingresosRepository.save(ingreso);
  }

  async remove(id: number): Promise<void> {
    const ingreso = await this.findOne(id);
    await this.ingresosRepository.remove(ingreso);
  }
}
