import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { BalanceModule } from './modules/balance/balance.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { RegistroMovilidadesModule } from './modules/registro-movilidades/registro-movilidades.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    GastosModule,
    IngresosModule,
    RegistroMovilidadesModule,
    BalanceModule,
  ],
})
export class AppModule {}
