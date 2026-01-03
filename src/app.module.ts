import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { dataSourceOptions } from './database/data-source';
import { BalanceModule } from './modules/balance/balance.module';
import { AuthModule } from './modules/auth/auth.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { RegistroMovilidadesModule } from './modules/registro-movilidades/registro-movilidades.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { TiendasIbkModule } from './modules/tiendas-ibk/tiendas-ibk.module';
import { HealthModule } from './health/health.module';

const validationSchema = Joi.object({
  DB_HOST: Joi.string().default('192.168.18.10'),
  DB_PORT: Joi.number().port().default(5433),
  DB_USER: Joi.string().default('gastometro'),
  DB_PASSWORD: Joi.string().default('gastometro'),
  DB_NAME: Joi.string().default('gastometro'),
  CACHE_TTL_SECONDS: Joi.number().integer().positive().default(60),
  CACHE_MAX_ITEMS: Joi.number().integer().positive().default(500),
  THROTTLE_TTL_SECONDS: Joi.number().integer().positive().default(60),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(60),
  JWT_SECRET: Joi.string().default('changeme'),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  EMAIL_WEBHOOK_URL: Joi.string().uri().optional(),
  EMAIL_WEBHOOK_API_KEY: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),
}).unknown(true);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema }),
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
        throttlers: [
          {
            ttl: Number(configService.get('THROTTLE_TTL_SECONDS') ?? 60),
            limit: Number(configService.get('THROTTLE_LIMIT') ?? 60),
          },
        ],
      }),
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    GastosModule,
    IngresosModule,
    RegistroMovilidadesModule,
    BalanceModule,
    TiendasIbkModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
