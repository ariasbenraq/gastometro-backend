import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EstadoServicio } from '../../entities/estado-servicio.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { UpdateEstadoServicioDto } from './dto/update-estado-servicio.dto';
import { UpdateTiendaIbkDto } from './dto/update-tienda-ibk.dto';
import { TiendasIbkService } from './tiendas-ibk.service';

describe('TiendasIbkService', () => {
  let service: TiendasIbkService;
  let tiendasRepository: jest.Mocked<Repository<TiendaIbk>>;
  let estadoServicioRepository: jest.Mocked<Repository<EstadoServicio>>;

  beforeEach(() => {
    tiendasRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<TiendaIbk>>;

    estadoServicioRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<EstadoServicio>>;

    service = new TiendasIbkService(tiendasRepository, estadoServicioRepository);
  });

  it('throws when tienda is not found', async () => {
    tiendasRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('clears estadoServicio when estadoServicioId is 0', async () => {
    const tienda = { estadoServicio: { id: 2 } } as TiendaIbk;
    const dto: UpdateTiendaIbkDto = { estadoServicioId: 0 };

    jest.spyOn(service, 'findOne').mockResolvedValue(tienda);
    tiendasRepository.save.mockResolvedValue(tienda);

    await service.update(1, dto);

    expect(tienda.estadoServicio).toBeUndefined();
  });

  it('updates estadoServicio via dedicated endpoint', async () => {
    const tienda = { estadoServicio: undefined } as TiendaIbk;
    const estadoServicio = { id: 5 } as EstadoServicio;
    const dto: UpdateEstadoServicioDto = { estadoServicioId: 5 };

    jest.spyOn(service, 'findOne').mockResolvedValue(tienda);
    estadoServicioRepository.findOne.mockResolvedValue(estadoServicio);
    tiendasRepository.save.mockResolvedValue(tienda);

    await service.updateEstadoServicio(1, dto);

    expect(tienda.estadoServicio).toBe(estadoServicio);
  });
});
