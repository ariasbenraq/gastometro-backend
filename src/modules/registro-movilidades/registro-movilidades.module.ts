import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroMovilidades } from '../../entities/registro-movilidades.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { RegistroMovilidadesController } from './registro-movilidades.controller';
import { RegistroMovilidadesService } from './registro-movilidades.service';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroMovilidades, TiendaIbk])],
  controllers: [RegistroMovilidadesController],
  providers: [RegistroMovilidadesService],
})
export class RegistroMovilidadesModule {}
