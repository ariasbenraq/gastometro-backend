import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { CreateRegistroMovilidadesDto } from './dto/create-registro-movilidades.dto';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';

@Injectable()
export class RegistroMovilidadesService {
  constructor(
    @InjectRepository(RegistroMovilidades)
    private readonly registroRepository: Repository<RegistroMovilidades>,
    @InjectRepository(TiendaIbk)
    private readonly tiendaRepository: Repository<TiendaIbk>,
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
      registro.tienda = await this.tiendaRepository.findOne({
        where: { id: dto.tiendaId },
      });
    }

    return this.registroRepository.save(registro);
  }

  findAll(): Promise<RegistroMovilidades[]> {
    return this.registroRepository.find({
      relations: ['tienda'],
      order: { fecha: 'DESC' },
    });
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
      registro.tienda = dto.tiendaId
        ? await this.tiendaRepository.findOne({ where: { id: dto.tiendaId } })
        : null;
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

    return this.registroRepository.save(registro);
  }

  async remove(id: number): Promise<void> {
    const registro = await this.findOne(id);
    await this.registroRepository.remove(registro);
  }
}
