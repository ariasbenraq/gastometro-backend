import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistritoLima } from '../../entities/distrito-lima.entity';
import { DistritosController } from './distritos.controller';
import { DistritosService } from './distritos.service';

@Module({
  imports: [TypeOrmModule.forFeature([DistritoLima])],
  controllers: [DistritosController],
  providers: [DistritosService],
  exports: [DistritosService],
})
export class DistritosModule {}
