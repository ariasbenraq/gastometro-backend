import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistritoLima } from '../../entities/distrito-lima.entity';
import { EntidadFinanciera } from '../../entities/entidad-financiera.entity';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { RegistroMovilidadesController } from './registro-movilidades.controller';
import { RegistroMovilidadesService } from './registro-movilidades.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistroMovilidades,
      DistritoLima,
      EntidadFinanciera,
    ]),
  ],
  controllers: [RegistroMovilidadesController],
  providers: [RegistroMovilidadesService],
})
export class RegistroMovilidadesModule {}
