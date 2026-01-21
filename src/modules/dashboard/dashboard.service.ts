import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { BalanceService } from '../balance/balance.service';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';
import {
  DashboardGastosByMonthDto,
  DashboardLatestGastoDto,
  DashboardSummaryResponseDto,
  DashboardTopDistritoDto,
} from './dto/dashboard-summary-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Gasto)
    private readonly gastosRepository: Repository<Gasto>,
    private readonly balanceService: BalanceService,
    private readonly dataSource: DataSource,
  ) {}

  async getSummary(
    query: DashboardSummaryQueryDto,
    userId?: number,
  ): Promise<DashboardSummaryResponseDto> {
    const now = new Date();
    const year = query.year ?? now.getUTCFullYear();
    const month = query.month ?? now.getUTCMonth() + 1;
    const latestLimit = query.latestLimit ?? 5;
    const topLimit = query.topLimit ?? 5;

    const monthRange = this.getDateRange(year, month);
    const [totals, latestGastos, topDistritos, gastosByMonth] =
      await Promise.all([
        this.balanceService.getMonthlyBalance(year, month, userId),
        this.getLatestGastos(monthRange, userId, latestLimit),
        this.getTopDistritos(monthRange, userId, topLimit),
        this.getGastosByMonth(year, userId),
      ]);

    return {
      year,
      month,
      totals: {
        totalIngresos: totals.totalIngresos,
        totalGastos: totals.totalGastos,
        totalMovilidades: totals.totalMovilidades,
        balance: totals.balance,
      },
      latestGastos,
      topDistritos,
      gastosByMonth,
    };
  }

  private getDateRange(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);
    return { startDate, endDate };
  }

  private async getLatestGastos(
    range: { startDate: string; endDate: string },
    userId: number | undefined,
    limit: number,
  ): Promise<DashboardLatestGastoDto[]> {
    const query = this.gastosRepository
      .createQueryBuilder('gasto')
      .select([
        'gasto.id',
        'gasto.fecha',
        'gasto.item',
        'gasto.motivo',
        'gasto.monto',
      ])
      .where('gasto.fecha BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .orderBy('gasto.fecha', 'DESC')
      .limit(limit);

    if (userId) {
      query.andWhere('gasto.usuario_id = :userId', { userId });
    }

    const gastos = await query.getMany();
    return gastos.map((gasto) => ({
      id: gasto.id,
      fecha: gasto.fecha,
      item: gasto.item,
      motivo: gasto.motivo,
      monto: gasto.monto,
    }));
  }

  private async getTopDistritos(
    range: { startDate: string; endDate: string },
    userId: number | undefined,
    limit: number,
  ): Promise<DashboardTopDistritoDto[]> {
    const params: Array<string | number> = [
      range.startDate,
      range.endDate,
      range.startDate,
      range.endDate,
    ];
    const userFilter = userId ? 'AND registro.usuario_id = $5' : '';
    if (userId) {
      params.push(userId);
    }

    const sql = `
      SELECT distrito.id, distrito.nombre, COUNT(*)::int AS total
      FROM (
        SELECT registro.inicio_id AS distrito_id
        FROM registro_movilidades registro
        WHERE registro.fecha BETWEEN $1 AND $2
        ${userFilter}
        UNION ALL
        SELECT registro.fin_id AS distrito_id
        FROM registro_movilidades registro
        WHERE registro.fecha BETWEEN $3 AND $4
        ${userFilter}
      ) movimientos
      JOIN distritos_lima distrito ON distrito.id = movimientos.distrito_id
      GROUP BY distrito.id, distrito.nombre
      ORDER BY total DESC
      LIMIT ${limit};
    `;

    const rows = await this.dataSource.query(sql, params);
    return rows.map((row: { id: number; nombre: string; total: number }) => ({
      id: Number(row.id),
      nombre: row.nombre,
      total: Number(row.total),
    }));
  }

  private async getGastosByMonth(
    year: number,
    userId: number | undefined,
  ): Promise<DashboardGastosByMonthDto[]> {
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31));
    const startDate = start.toISOString().slice(0, 10);
    const endDate = end.toISOString().slice(0, 10);

    const query = this.gastosRepository
      .createQueryBuilder('gasto')
      .select('EXTRACT(MONTH FROM gasto.fecha)', 'month')
      .addSelect('COALESCE(SUM(gasto.monto), 0)', 'total')
      .where('gasto.fecha BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('month')
      .orderBy('month', 'ASC');

    if (userId) {
      query.andWhere('gasto.usuario_id = :userId', { userId });
    }

    const rows = await query.getRawMany<{ month: string; total: string }>();
    const totalsMap = new Map<number, number>();
    rows.forEach((row) => {
      totalsMap.set(Number(row.month), Number(row.total));
    });

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return {
        month,
        total: totalsMap.get(month) ?? 0,
      };
    });
  }
}
