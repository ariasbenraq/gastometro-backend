import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterGastosDto } from '../gastos/dto/filter-gastos.dto';
import { FilterIngresosDto } from '../ingresos/dto/filter-ingresos.dto';
import { FilterRegistroMovilidadesDto } from '../registro-movilidades/dto/filter-registro-movilidades.dto';
import { FilterTiendasIbkDto } from '../tiendas-ibk/dto/filter-tiendas-ibk.dto';

describe('Filter DTO validation', () => {
  it('rejects invalid dates for gastos filters', async () => {
    const instance = plainToInstance(FilterGastosDto, {
      from: '2025-02-29',
      to: '2025-02-29',
    });
    const errors = await validate(instance);
    expect(errors).not.toHaveLength(0);
  });

  it('accepts valid leap day date for ingresos filters', async () => {
    const instance = plainToInstance(FilterIngresosDto, {
      from: '2024-02-29',
      to: '2024-02-29',
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
      from: '2025-02-29',
    });
    const errors = await validate(instance);
    expect(errors).not.toHaveLength(0);
  });

  it('casts and validates estadoServicioId for tiendas filters', async () => {
    const instance = plainToInstance(FilterTiendasIbkDto, {
      estadoServicioId: '2',
      q: 'Miraflores',
      page: '1',
      limit: '25',
    });
    const errors = await validate(instance);
    expect(errors).toHaveLength(0);
    expect(instance.estadoServicioId).toBe(2);
    expect(instance.page).toBe(1);
    expect(instance.limit).toBe(25);
  });
});
