import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { Ingreso } from '../../entities/ingreso.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { BalanceService } from './balance.service';

type QueryBuilderMock = {
  select: jest.Mock;
  where: jest.Mock;
  getRawOne: jest.Mock;
};

const createQueryBuilder = (total: string) => {
  const qb: QueryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ total }),
  };
  return qb;
};

describe('BalanceService', () => {
  it('validates year and month inputs', async () => {
    const ingresosRepository = {} as Repository<Ingreso>;
    const gastosRepository = {} as Repository<Gasto>;
    const movilidadesRepository = {} as Repository<RegistroMovilidades>;

    const service = new BalanceService(
      ingresosRepository,
      gastosRepository,
      movilidadesRepository,
    );

    await expect(service.getMonthlyBalance(0, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.getMonthlyBalance(2024, 13)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.getAnnualBalance(-1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns computed totals for a monthly balance', async () => {
    const ingresosQuery = createQueryBuilder('100');
    const gastosQuery = createQueryBuilder('40');
    const movilidadesQuery = createQueryBuilder('10');

    const ingresosRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(ingresosQuery),
    } as unknown as Repository<Ingreso>;
    const gastosRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(gastosQuery),
    } as unknown as Repository<Gasto>;
    const movilidadesRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(movilidadesQuery),
    } as unknown as Repository<RegistroMovilidades>;

    const service = new BalanceService(
      ingresosRepository,
      gastosRepository,
      movilidadesRepository,
    );

    const result = await service.getMonthlyBalance(2024, 2);

    expect(ingresosQuery.where).toHaveBeenCalledWith(
      'ingresos.fecha BETWEEN :start AND :end',
      { start: '2024-02-01', end: '2024-02-29' },
    );
    expect(result).toEqual({
      year: 2024,
      month: 2,
      totalIngresos: 100,
      totalGastos: 40,
      totalMovilidades: 10,
      balance: 50,
    });
  });
});
