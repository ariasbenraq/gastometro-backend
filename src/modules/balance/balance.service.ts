import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { Ingreso } from '../../entities/ingreso.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Ingreso)
    private readonly ingresosRepository: Repository<Ingreso>,
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
    @InjectRepository(RegistroMovilidades)
    private readonly movilidadesRepository: Repository<RegistroMovilidades>,
  ) {}

  async getBalance() {
    const ingresos = (await this.ingresosRepository
      .createQueryBuilder('ingresos')
      .select('COALESCE(SUM(ingresos.monto), 0)', 'total')
      .getRawOne<{ total: string }>()) ?? { total: '0' };

    const gastos = (await this.gastosRepository
      .createQueryBuilder('gastos')
      .select('COALESCE(SUM(gastos.monto), 0)', 'total')
      .getRawOne<{ total: string }>()) ?? { total: '0' };

    const movilidades = (await this.movilidadesRepository
      .createQueryBuilder('registro_movilidades')
      .select('COALESCE(SUM(registro_movilidades.monto), 0)', 'total')
      .getRawOne<{ total: string }>()) ?? { total: '0' };

    const totalIngresos = Number(ingresos.total || 0);
    const totalGastos = Number(gastos.total || 0);
    const totalMovilidades = Number(movilidades.total || 0);

    return {
      totalIngresos,
      totalGastos,
      totalMovilidades,
      balance: totalIngresos - totalGastos - totalMovilidades,
    };
  }
}
