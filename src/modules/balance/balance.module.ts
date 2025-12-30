import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { Ingreso } from '../../entities/ingreso.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ingreso, Gasto, RegistroMovilidades])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
