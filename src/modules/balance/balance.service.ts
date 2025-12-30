import { BadRequestException, Injectable } from '@nestjs/common';
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

  private async sumAmount(
    repository: Repository<Ingreso | Gasto | RegistroMovilidades>,
    alias: string,
    range?: { startDate: string; endDate: string },
  ) {
    let query = repository
      .createQueryBuilder(alias)
      .select(`COALESCE(SUM(${alias}.monto), 0)`, 'total');

    if (range) {
      query = query.where(`${alias}.fecha BETWEEN :start AND :end`, {
        start: range.startDate,
        end: range.endDate,
      });
    }

    const result = (await query.getRawOne<{ total: string }>()) ?? {
      total: '0',
    };

    return Number(result.total || 0);
  }

  private formatDate(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private async getTotals(range?: { startDate: string; endDate: string }) {
    const totalIngresos = await this.sumAmount(
      this.ingresosRepository,
      'ingresos',
      range,
    );
    const totalGastos = await this.sumAmount(
      this.gastosRepository,
      'gastos',
      range,
    );
    const totalMovilidades = await this.sumAmount(
      this.movilidadesRepository,
      'registro_movilidades',
      range,
    );

    return {
      totalIngresos,
      totalGastos,
      totalMovilidades,
      balance: totalIngresos - totalGastos - totalMovilidades,
    };
  }

  async getBalance() {
    return this.getTotals();
  }

  async getMonthlyBalance(year: number, month: number) {
    if (!Number.isInteger(year) || year < 1) {
      throw new BadRequestException('El año debe ser un valor válido.');
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12.');
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));
    const range = {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end),
    };

    return {
      year,
      month,
      ...(await this.getTotals(range)),
    };
  }

  async getAnnualBalance(year: number) {
    if (!Number.isInteger(year) || year < 1) {
      throw new BadRequestException('El año debe ser un valor válido.');
    }

    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31));
    const range = {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end),
    };

    return {
      year,
      ...(await this.getTotals(range)),
    };
  }
}
