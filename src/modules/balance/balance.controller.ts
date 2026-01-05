import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { BalanceService } from './balance.service';

@Controller('balance')
@UseInterceptors(CacheInterceptor)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getBalance(
    @Query() query: BalanceQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.balanceService.getBalance(query, user);
  }

  @Get('mensual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getMonthlyBalance(
    @Query() query: BalanceQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.balanceService.getMonthlyBalance(query, user);
  }

  @Get('anual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getAnnualBalance(
    @Query() query: BalanceQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.balanceService.getAnnualBalance(query, user);
  }
}
