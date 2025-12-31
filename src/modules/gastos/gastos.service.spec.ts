import { NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { GastosService } from './gastos.service';
import { UpdateGastoDto } from './dto/update-gasto.dto';

describe('GastosService', () => {
  let service: GastosService;
  let gastosRepository: jest.Mocked<Repository<Gasto>>;
  let personalRepository: jest.Mocked<Repository<PersonalAdministrativo>>;
  let cacheManager: jest.Mocked<Cache>;

  beforeEach(() => {
    gastosRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Gasto>>;

    personalRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<PersonalAdministrativo>>;

    cacheManager = {
      reset: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Cache>;

    service = new GastosService(
      gastosRepository,
      personalRepository,
      cacheManager,
    );
  });

  it('throws when gasto is not found', async () => {
    gastosRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('assigns aprobadoPor on create', async () => {
    const gasto = { monto: 10 } as Gasto;
    const aprobadoPor = { id: 2 } as PersonalAdministrativo;

    gastosRepository.create.mockReturnValue(gasto);
    personalRepository.findOne.mockResolvedValue(aprobadoPor);
    gastosRepository.save.mockResolvedValue(gasto);

    await service.create({
      fecha: '2024-01-01',
      item: 'Combustible',
      motivo: 'Viaje',
      monto: 10,
      aprobadoPorId: 2,
    });

    expect(gasto.aprobadoPor).toBe(aprobadoPor);
    expect(cacheManager.reset).toHaveBeenCalled();
  });

  it('clears aprobadoPor when aprobadoPorId is 0', async () => {
    const gasto = { aprobadoPor: { id: 5 } } as Gasto;
    const dto: UpdateGastoDto = { aprobadoPorId: 0 };

    jest.spyOn(service, 'findOne').mockResolvedValue(gasto);
    gastosRepository.save.mockResolvedValue(gasto);

    await service.update(1, dto);

    expect(gasto.aprobadoPor).toBeUndefined();
    expect(cacheManager.reset).toHaveBeenCalled();
  });
});
