import {
  Controller,
  Get,
  ParseIntPipe,
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

  @Get()
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getBalance(
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, userId);
    return this.balanceService.getBalance(
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }

  @Get('mensual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, userId);
    return this.balanceService.getMonthlyBalance(
      year,
      month,
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }

  @Get('anual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getAnnualBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('dateField', new ParseEnumPipe(BalanceDateField, { optional: true }))
    dateField?: BalanceDateField,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, userId);
    return this.balanceService.getAnnualBalance(
      year,
      resolvedUserId,
      this.resolveDateField(dateField),
    );
  }
}

enum BalanceDateField {
  FECHA = 'fecha',
  CREATED_AT = 'createdAt',
}
