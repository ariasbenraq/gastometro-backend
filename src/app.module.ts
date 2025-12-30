import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoServicio } from './entities/estado-servicio.entity';
import { Gasto } from './entities/gasto.entity';
import { Ingreso } from './entities/ingreso.entity';
import { PersonalAdministrativo } from './entities/personal-administrativo.entity';
import { RegistroMovilidades } from './entities/registro-movilidades.entity';
import { RolesUsuario } from './entities/roles-usuario.entity';
import { TiendaIbk } from './entities/tienda-ibk.entity';
import { Usuario } from './entities/usuario.entity';
import { BalanceModule } from './modules/balance/balance.module';
import { GastosModule } from './modules/gastos/gastos.module';
import { IngresosModule } from './modules/ingresos/ingresos.module';
import { RegistroMovilidadesModule } from './modules/registro-movilidades/registro-movilidades.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? '192.168.18.10',
      port: Number(process.env.DB_PORT ?? 5433),
      username: process.env.DB_USER ?? 'gastometro',
      password: process.env.DB_PASSWORD ?? 'gastometro',
      database: process.env.DB_NAME ?? 'gastometro',
      entities: [
        Gasto,
        Ingreso,
        RegistroMovilidades,
        PersonalAdministrativo,
        TiendaIbk,
        EstadoServicio,
        RolesUsuario,
        Usuario,
      ],
      synchronize: true,
    }),
    GastosModule,
    IngresosModule,
    RegistroMovilidadesModule,
    BalanceModule,
  ],
})
export class AppModule {}
