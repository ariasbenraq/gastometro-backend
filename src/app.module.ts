import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: Number(configService.get('CACHE_TTL_SECONDS') ?? 60),
        max: Number(configService.get('CACHE_MAX_ITEMS') ?? 500),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: Number(configService.get('THROTTLE_TTL_SECONDS') ?? 60),
        limit: Number(configService.get('THROTTLE_LIMIT') ?? 60),
      }),
    }),
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
