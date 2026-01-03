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
import { BalanceService } from './balance.service';

@Controller('balance')
@UseInterceptors(CacheInterceptor)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @CacheTTL(30)
  getBalance(@CurrentUser() user?: AuthenticatedUser) {
    const userId = user?.userId;
    return this.balanceService.getBalance(userId);
  }

  @Get('mensual')
  @CacheTTL(30)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.balanceService.getMonthlyBalance(year, month, userId);
  }

  @Get('anual')
  @CacheTTL(30)
  getAnnualBalance(
    @Query('year', ParseIntPipe) year: number,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.userId;
    return this.balanceService.getAnnualBalance(year, userId);
  }
}
