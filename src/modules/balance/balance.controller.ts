import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  getBalance() {
    return this.balanceService.getBalance();
  }

  @Get('mensual')
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.balanceService.getMonthlyBalance(year, month);
  }

  @Get('anual')
  getAnnualBalance(@Query('year', ParseIntPipe) year: number) {
    return this.balanceService.getAnnualBalance(year);
  }
}
