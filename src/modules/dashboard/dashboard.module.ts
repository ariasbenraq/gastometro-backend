import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { BalanceModule } from '../balance/balance.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Gasto, RegistroMovilidades]), BalanceModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
