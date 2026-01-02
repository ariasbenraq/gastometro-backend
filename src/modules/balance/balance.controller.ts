import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { BalanceService } from './balance.service';

@Controller('balance')
@UseInterceptors(CacheInterceptor)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @CacheTTL(30)
  getBalance() {
    return this.balanceService.getBalance();
  }

  @Get('mensual')
  @CacheTTL(30)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.balanceService.getMonthlyBalance(year, month);
  }

  @Get('anual')
  @CacheTTL(30)
  getAnnualBalance(@Query('year', ParseIntPipe) year: number) {
    return this.balanceService.getAnnualBalance(year);
  }
}
