import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Request } from 'express';
import { BalanceService } from './balance.service';

type AuthenticatedRequest = Request & { user?: { userId?: number } };

@Controller('balance')
@UseInterceptors(CacheInterceptor)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @CacheTTL(30)
  getBalance(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.userId;
    return this.balanceService.getBalance(userId);
  }

  @Get('mensual')
  @CacheTTL(30)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.balanceService.getMonthlyBalance(year, month, userId);
  }

  @Get('anual')
  @CacheTTL(30)
  getAnnualBalance(
    @Query('year', ParseIntPipe) year: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId;
    return this.balanceService.getAnnualBalance(year, userId);
  }
}
