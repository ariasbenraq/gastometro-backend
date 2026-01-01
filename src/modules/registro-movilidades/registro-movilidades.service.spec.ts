import { NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { RegistroMovilidadesService } from './registro-movilidades.service';
import { UpdateRegistroMovilidadesDto } from './dto/update-registro-movilidades.dto';

describe('RegistroMovilidadesService', () => {
  let service: RegistroMovilidadesService;
  let registroRepository: jest.Mocked<Repository<RegistroMovilidades>>;
  let tiendaRepository: jest.Mocked<Repository<TiendaIbk>>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(() => {
    registroRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<RegistroMovilidades>>;

    tiendaRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<TiendaIbk>>;

    cacheManager = {
      reset: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Cache>;

    service = new RegistroMovilidadesService(
      registroRepository,
      tiendaRepository,
      cacheManager,
    );
  });

  it('throws when registro is not found', async () => {
    registroRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('clears tienda when tiendaId is 0', async () => {
    const registro = { tienda: { id: 4 } } as RegistroMovilidades;
    const dto: UpdateRegistroMovilidadesDto = { tiendaId: 0 };

    jest.spyOn(service, 'findOne').mockResolvedValue(registro);
    registroRepository.save.mockResolvedValue(registro);

    await service.update(1, dto);

    expect(registro.tienda).toBeUndefined();
    expect(cacheManager.reset).toHaveBeenCalled();
  });
});
