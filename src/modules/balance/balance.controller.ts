import {
  BadRequestException,
  Controller,
  Get,
  ParseEnumPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { BalanceService } from './balance.service';

enum BalanceDateField {
  FECHA = 'fecha',
  CREATED_AT = 'createdAt',
}

@Controller('balance')
@UseInterceptors(CacheInterceptor)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  private resolveDateField(field?: BalanceDateField) {
    return field ?? BalanceDateField.FECHA;
  }

  private resolveUserId(user?: AuthenticatedUser, requestedUserId?: number) {
    if (user?.rol === UserRole.USER) {
      return user.userId;
    }

    return requestedUserId;
  }

  private parseOptionalInt(value: string | undefined, field: string) {
    if (value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException(
        `El parámetro ${field} debe ser un número entero válido.`,
      );
    }

    return parsed;
  }

  private parseRequiredInt(value: string | undefined, field: string) {
    if (value === undefined || value === '') {
      throw new BadRequestException(`El parámetro ${field} es obligatorio.`);
    }

    return this.parseOptionalInt(value, field) as number;
  }

  @Get()
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getBalance(
    @Query('userId') userId?: string,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(
      user,
      this.parseOptionalInt(userId, 'userId'),
    );
    return this.balanceService.getBalance(
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }

  @Get('mensual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getMonthlyBalance(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('userId') userId?: string,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(
      user,
      this.parseOptionalInt(userId, 'userId'),
    );
    return this.balanceService.getMonthlyBalance(
      this.parseRequiredInt(year, 'year'),
      this.parseRequiredInt(month, 'month'),
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }

  @Get('anual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getAnnualBalance(
    @Query('year') year?: string,
    @Query('userId') userId?: string,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(
      user,
      this.parseOptionalInt(userId, 'userId'),
    );
    return this.balanceService.getAnnualBalance(
      this.parseRequiredInt(year, 'year'),
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }
}
