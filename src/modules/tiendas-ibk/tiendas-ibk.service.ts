import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoServicio } from '../../entities/estado-servicio.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { CreateTiendaIbkDto } from './dto/create-tienda-ibk.dto';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { UpdateTiendaIbkDto } from './dto/update-tienda-ibk.dto';

@Injectable()
export class TiendasIbkService {
  constructor(
    @InjectRepository(TiendaIbk)
    private readonly tiendasRepository: Repository<TiendaIbk>,
    @InjectRepository(EstadoServicio)
    private readonly estadoServicioRepository: Repository<EstadoServicio>,
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

    return this.tiendasRepository.save(tienda);
  }

  findAll(): Promise<TiendaIbk[]> {
    return this.tiendasRepository.find({
      relations: ['estadoServicio'],
      order: { nombre_tienda: 'ASC' },
    });
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

    return this.tiendasRepository.save(tienda);
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

    return this.tiendasRepository.save(tienda);
  }

  async remove(id: number): Promise<void> {
    const tienda = await this.findOne(id);
    await this.tiendasRepository.remove(tienda);
  }
}
