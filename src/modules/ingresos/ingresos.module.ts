import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingreso } from '../../entities/ingreso.entity';
import { PersonalAdministrativo } from '../../entities/personal-administrativo.entity';
import { Usuario } from '../../entities/usuario.entity';
import { IngresosController } from './ingresos.controller';
import { IngresosService } from './ingresos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ingreso, PersonalAdministrativo, Usuario])],
  controllers: [IngresosController],
  providers: [IngresosService],
})
export class IngresosModule {}
