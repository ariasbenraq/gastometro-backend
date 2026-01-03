import {
  Controller,
  Get,
  ParseIntPipe,
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

  private resolveUserId(user?: AuthenticatedUser) {
    return user?.rol === UserRole.USER ? user.userId : undefined;
  }

  @Get()
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getBalance(@CurrentUser() user?: AuthenticatedUser) {
    const userId = this.resolveUserId(user);
    return this.balanceService.getBalance(userId);
  }

  @Get('mensual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.balanceService.getMonthlyBalance(year, month, userId);
  }

  @Get('anual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getAnnualBalance(
    @Query('year', ParseIntPipe) year: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = this.resolveUserId(user);
    return this.balanceService.getAnnualBalance(year, userId);
  }
}
