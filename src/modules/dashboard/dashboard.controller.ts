import { Controller, Get, Query } from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/signup.dto';
import { DashboardSummaryQueryDto } from './dto/dashboard-summary-query.dto';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.ANALYST_BALANCE, UserRole.USER)
  getSummary(
    @Query() query: DashboardSummaryQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const userId = user?.rol === UserRole.USER ? user.userId : undefined;
    return this.dashboardService.getSummary(query, userId);
  }
}
