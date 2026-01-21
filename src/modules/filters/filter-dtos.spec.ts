import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterGastosDto } from '../gastos/dto/filter-gastos.dto';
import { FilterIngresosDto } from '../ingresos/dto/filter-ingresos.dto';
import { FilterRegistroMovilidadesDto } from '../registro-movilidades/dto/filter-registro-movilidades.dto';
import { FilterClientesDto } from '../clientes/dto/filter-clientes.dto';

describe('Filter DTO validation', () => {
  it('rejects invalid dates for gastos filters', async () => {
    const instance = plainToInstance(FilterGastosDto, {
      startDate: '2025-02-29',
      endDate: '2025-02-29',
    });
    const errors = await validate(instance);
    expect(errors).not.toHaveLength(0);
  });

  it('accepts valid leap day date for ingresos filters', async () => {
    const instance = plainToInstance(FilterIngresosDto, {
      startDate: '2024-02-29',
      endDate: '2024-02-29',
      page: '2',
      limit: '15',
    });
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
    expect(instance.page).toBe(2);
    expect(instance.limit).toBe(15);
  });

  it('rejects invalid dates for registro movilidades filters', async () => {
    const instance = plainToInstance(FilterRegistroMovilidadesDto, {
      startDate: '2025-02-29',
    });
    const errors = await validate(instance);
    expect(errors).not.toHaveLength(0);
  });

  it('casts and validates clientes filters', async () => {
    const instance = plainToInstance(FilterClientesDto, {
      tipo: 'Banco',
      q: 'BCP',
      page: '1',
      limit: '25',
    });
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
    expect(instance.page).toBe(1);
    expect(instance.limit).toBe(25);
  });
});
