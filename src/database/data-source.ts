import { DataSource, DataSourceOptions } from 'typeorm';
import { DistritoLima } from '../entities/distrito-lima.entity';
import { EntidadFinanciera } from '../entities/entidad-financiera.entity';
import { Gasto } from '../entities/gasto.entity';
import { Ingreso } from '../entities/ingreso.entity';
import { PersonalAdministrativo } from '../entities/personal-administrativo.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { RegistroMovilidades } from '../entities/registro-movilidades.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { RolesUsuario } from '../entities/roles-usuario.entity';
import { Usuario } from '../entities/usuario.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? '192.168.18.10',
  port: Number(process.env.DB_PORT ?? 5433),
  username: process.env.DB_USER ?? 'gastometro',
  password: process.env.DB_PASSWORD ?? 'gastometro',
  database: process.env.DB_NAME ?? 'gastometro',
  extra: {
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? 30000),
    connectionTimeoutMillis: Number(
      process.env.DB_POOL_CONN_TIMEOUT_MS ?? 2000,
    ),
  },
  entities: [
    Gasto,
    Ingreso,
    RegistroMovilidades,
    PersonalAdministrativo,
    DistritoLima,
    EntidadFinanciera,
    RolesUsuario,
    Usuario,
    RefreshToken,
    PasswordResetToken,
  ],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
