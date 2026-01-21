import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntidadFinanciera } from '../../entities/entidad-financiera.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntidadFinanciera])],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
