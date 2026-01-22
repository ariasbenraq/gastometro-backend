import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { BalanceModule } from '../balance/balance.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroMovilidades]), BalanceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
