import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { BalanceModule } from './modules/balance/balance.module';
import { AuthModule } from './modules/auth/auth.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { RegistroMovilidadesModule } from './modules/registro-movilidades/registro-movilidades.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    GastosModule,
    IngresosModule,
    RegistroMovilidadesModule,
    BalanceModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
