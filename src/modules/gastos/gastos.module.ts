import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gasto } from '../../entities/gasto.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { GastosController } from './gastos.controller';
import { GastosService } from './gastos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Gasto, PersonalAdministrativo])],
  controllers: [GastosController],
  providers: [GastosService],
})
export class GastosModule {}
