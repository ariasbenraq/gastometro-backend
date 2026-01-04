import {
  BadRequestException,
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

  private resolveUserId(user?: AuthenticatedUser, requestedUserId?: number) {
    return user?.rol === UserRole.USER ? user.userId : requestedUserId;
  }

  private parseUserId(userId?: string) {
    if (!userId) {
      return undefined;
    }
    const parsed = Number(userId);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('El usuario debe ser un id válido.');
    }
    return parsed;
  }

  @Get()
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getBalance(
    @Query('userId') userId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, this.parseUserId(userId));
    return this.balanceService.getBalance(resolvedUserId);
  }

  @Get('mensual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getMonthlyBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
    @Query('userId') userId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, this.parseUserId(userId));
    return this.balanceService.getMonthlyBalance(year, month, resolvedUserId);
  }

  @Get('anual')
  @CacheTTL(30)
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getAnnualBalance(
    @Query('year', ParseIntPipe) year: number,
    @Query('userId') userId?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const resolvedUserId = this.resolveUserId(user, this.parseUserId(userId));
    return this.balanceService.getAnnualBalance(year, resolvedUserId);
  }
}
