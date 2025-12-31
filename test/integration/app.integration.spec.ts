import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { EstadoServicio } from '../../src/entities/estado-servicio.entity';
import { Gasto } from '../../src/entities/gasto.entity';
import { Ingreso } from '../../src/entities/ingreso.entity';
import { PersonalAdministrativo } from '../../src/entities/personal-administrativo.entity';
import { RefreshToken } from '../../src/entities/refresh-token.entity';
import { RegistroMovilidades } from '../../src/entities/registro-movilidades.entity';
import { RolesUsuario } from '../../src/entities/roles-usuario.entity';
import { TiendaIbk } from '../../src/entities/tienda-ibk.entity';
import { Usuario } from '../../src/entities/usuario.entity';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { BalanceModule } from '../../src/modules/balance/balance.module';
import { GastosModule } from '../../src/modules/gastos/gastos.module';
import { IngresosModule } from '../../src/modules/ingresos/ingresos.module';
import { RegistroMovilidadesModule } from '../../src/modules/registro-movilidades/registro-movilidades.module';

describe('Integration tests (HTTP + DB)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const database = process.env.TEST_DB_NAME ?? process.env.DB_NAME ?? 'gastometro_test';
    const host = process.env.TEST_DB_HOST ?? process.env.DB_HOST ?? 'localhost';
    const port = Number(process.env.TEST_DB_PORT ?? process.env.DB_PORT ?? 5432);
    const username = process.env.TEST_DB_USER ?? process.env.DB_USER ?? 'postgres';
    const password = process.env.TEST_DB_PASSWORD ?? process.env.DB_PASSWORD ?? 'postgres';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          dropSchema: true,
          synchronize: true,
          entities: [
            Gasto,
            Ingreso,
            RegistroMovilidades,
            PersonalAdministrativo,
            TiendaIbk,
            EstadoServicio,
            RolesUsuario,
            Usuario,
            RefreshToken,
          ],
        }),
        AuthModule,
        GastosModule,
        IngresosModule,
        RegistroMovilidadesModule,
        BalanceModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('validates signup payloads', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        nombre_apellido: 'Juan Perez',
        usuario: 'juan',
        email: 'invalid-email',
        password: 'weak',
      })
      .expect(400);
  });

  it('creates and lists gastos', async () => {
    const response = await request(app.getHttpServer())
      .post('/gastos')
      .send({
        fecha: '2024-01-01',
        item: 'Combustible',
        motivo: 'Viaje',
        monto: 120.5,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      item: 'Combustible',
      motivo: 'Viaje',
      fecha: '2024-01-01',
    });

    const list = await request(app.getHttpServer()).get('/gastos').expect(200);
    expect(list.body).toHaveLength(1);
  });

  it('validates ingresos payloads', async () => {
    await request(app.getHttpServer())
      .post('/ingresos')
      .send({
        monto: 50,
      })
      .expect(400);
  });

  it('validates registro movilidades payloads', async () => {
    await request(app.getHttpServer())
      .post('/registro-movilidades')
      .send({
        fecha: '2024-01-01',
        inicio: 'A',
        fin: 'B',
        motivo: 'Entrega',
        detalle: 'Detalles',
        monto: 10,
      })
      .expect(400);
  });

  it('computes balance from persisted data', async () => {
    await request(app.getHttpServer())
      .post('/ingresos')
      .send({ fecha: '2024-02-01', monto: 100 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/gastos')
      .send({ fecha: '2024-02-02', item: 'Comida', motivo: 'Almuerzo', monto: 40 })
      .expect(201);

    await request(app.getHttpServer())
      .post('/registro-movilidades')
      .send({
        fecha: '2024-02-03',
        inicio: 'A',
        fin: 'B',
        motivo: 'Ruta',
        detalle: 'Detalle',
        monto: 10,
        ticket: 'TCK-1',
      })
      .expect(201);

    const balance = await request(app.getHttpServer())
      .get('/balance')
      .expect(200);

    expect(balance.body).toEqual({
      totalIngresos: 100,
      totalGastos: 40,
      totalMovilidades: 10,
      balance: 50,
    });
  });
});
