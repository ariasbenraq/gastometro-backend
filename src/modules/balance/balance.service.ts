import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { Ingreso } from '../../entities/ingreso.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';

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
    range?: { startDate?: string; endDate?: string },
    userId?: number,
    dateField: 'fecha' | 'createdAt' = 'fecha',
  ) {
    let query = repository
      .createQueryBuilder(alias)
      .select(`COALESCE(SUM(${alias}.monto), 0)`, 'total');

    if (userId) {
      query = query.where(`${alias}.usuario_id = :userId`, { userId });
    }

    if (range?.startDate && range?.endDate) {
      const whereMethod = userId ? 'andWhere' : 'where';
      query = query[whereMethod](
        `${alias}.${dateField} BETWEEN :start AND :end`,
        {
          start: range.startDate,
          end: range.endDate,
        },
      );
    } else if (range?.startDate) {
      const whereMethod = userId ? 'andWhere' : 'where';
      query = query[whereMethod](
        `${alias}.${dateField} >= :start`,
        { start: range.startDate },
      );
    } else if (range?.endDate) {
      const whereMethod = userId ? 'andWhere' : 'where';
      query = query[whereMethod](
        `${alias}.${dateField} <= :end`,
        { end: range.endDate },
      );
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

  private resolveUserId(
    currentUser?: AuthenticatedUser,
    requestedUserId?: number,
  ) {
    if (currentUser?.rol === UserRole.USER) {
      return currentUser.userId;
    }
    return requestedUserId;
  }

  private resolveDateRange(filters?: BalanceQueryDto) {
    if (!filters) {
      return undefined;
    }

    if (filters.from || filters.to) {
      return {
        startDate: filters.from,
        endDate: filters.to,
      };
    }

    if (filters.month !== undefined) {
      if (!filters.year) {
        throw new BadRequestException(
          'El año es obligatorio cuando se especifica el mes.',
        );
      }
      const start = new Date(Date.UTC(filters.year, filters.month - 1, 1));
      const end = new Date(Date.UTC(filters.year, filters.month, 0));
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
      };
    }

    if (filters.year) {
      const start = new Date(Date.UTC(filters.year, 0, 1));
      const end = new Date(Date.UTC(filters.year, 11, 31));
      return {
        startDate: this.formatDate(start),
        endDate: this.formatDate(end),
      };
    }

    return undefined;
  }

  private async getTotals(
    range?: { startDate?: string; endDate?: string },
    userId?: number,
    dateField: 'fecha' | 'createdAt' = 'fecha',
  ) {
    const totalIngresos = await this.sumAmount(
      this.ingresosRepository,
      'ingresos',
      range,
      userId,
      dateField,
    );
    const totalGastos = await this.sumAmount(
      this.gastosRepository,
      'gastos',
      range,
      userId,
      dateField,
    );
    const totalMovilidades = await this.sumAmount(
      this.movilidadesRepository,
      'registro_movilidades',
      range,
      userId,
      dateField,
    );

    return {
      totalIngresos,
      totalGastos,
      totalMovilidades,
      balance: totalIngresos - totalGastos - totalMovilidades,
    };
  }

  async getBalance(
    filters: BalanceQueryDto,
    currentUser?: AuthenticatedUser,
    dateField: 'fecha' | 'createdAt' = 'fecha',
  ) {
    const userId = this.resolveUserId(currentUser, filters.userId);
    const range = this.resolveDateRange(filters);
    return this.getTotals(range, userId, dateField);
  }

  async getMonthlyBalance(
    filters: BalanceQueryDto,
    currentUser?: AuthenticatedUser,
    dateField: 'fecha' | 'createdAt' = 'fecha',
  ) {
    if (!filters.month || !filters.year) {
      throw new BadRequestException(
        'Debe especificar el año y mes para el balance mensual.',
      );
    }

    const userId = this.resolveUserId(currentUser, filters.userId);
    const range = this.resolveDateRange(filters);

    return {
      year: filters.year,
      month: filters.month,
      ...(await this.getTotals(range, userId, dateField)),
    };
  }

  async getAnnualBalance(
    filters: BalanceQueryDto,
    currentUser?: AuthenticatedUser,
    dateField: 'fecha' | 'createdAt' = 'fecha',
  ) {
    if (!filters.year) {
      throw new BadRequestException('Debe especificar el año del balance.');
    }

    const userId = this.resolveUserId(currentUser, filters.userId);
    const range = this.resolveDateRange(filters);

    return {
      year: filters.year,
      ...(await this.getTotals(range, userId, dateField)),
    };
  }
}
