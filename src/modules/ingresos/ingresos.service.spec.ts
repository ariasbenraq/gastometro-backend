import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Ingreso } from '../../entities/ingreso.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { IngresosService } from './ingresos.service';
import { UpdateIngresoDto } from './dto/update-ingreso.dto';

describe('IngresosService', () => {
  let service: IngresosService;
  let ingresosRepository: jest.Mocked<Repository<Ingreso>>;
  let personalRepository: jest.Mocked<Repository<PersonalAdministrativo>>;

  beforeEach(() => {
    ingresosRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Ingreso>>;

    personalRepository = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<PersonalAdministrativo>>;

    service = new IngresosService(ingresosRepository, personalRepository);
  });

  it('throws when ingreso is not found', async () => {
    ingresosRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('clears depositadoPor when depositadoPorId is 0', async () => {
    const ingreso = { depositadoPor: { id: 3 } } as Ingreso;
    const dto: UpdateIngresoDto = { depositadoPorId: 0 };

    jest.spyOn(service, 'findOne').mockResolvedValue(ingreso);
    ingresosRepository.save.mockResolvedValue(ingreso);

    await service.update(1, dto);

    expect(ingreso.depositadoPor).toBeUndefined();
  });
});
