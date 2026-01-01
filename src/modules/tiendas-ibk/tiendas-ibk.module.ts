import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoServicio } from '../../entities/estado-servicio.entity';
import { TiendaIbk } from '../../entities/tienda-ibk.entity';
import { TiendasIbkController } from './tiendas-ibk.controller';
import { TiendasIbkService } from './tiendas-ibk.service';

@Module({
  imports: [TypeOrmModule.forFeature([TiendaIbk, EstadoServicio])],
  controllers: [TiendasIbkController],
  providers: [TiendasIbkService],
})
export class TiendasIbkModule {}
