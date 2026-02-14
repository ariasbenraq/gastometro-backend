import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy';
import { GastosController } from '../../src/modules/gastos/gastos.controller';
import { GastosService } from '../../src/modules/gastos/gastos.service';
import { IngresosController } from '../../src/modules/ingresos/ingresos.controller';
import { IngresosService } from '../../src/modules/ingresos/ingresos.service';
import { Gasto } from '../../src/entities/gasto.entity';
import { Ingreso } from '../../src/entities/ingreso.entity';
import { PersonalAdministrativo } from '../../src/entities/personal-administrativo.entity';
import { RefreshToken } from '../../src/entities/refresh-token.entity';
import { Usuario } from '../../src/entities/usuario.entity';

type FindOptions<T> = {
  where?: Partial<T> | Array<Partial<T>>;
};

class InMemoryRepository<T extends { id?: number }> {
  private entities: T[] = [];
  private idSequence = 1;

  create(payload: Partial<T>): T {
    return { ...payload } as T;
  }

  async save(entity: T): Promise<T> {
    if (!entity.id) {
      entity.id = this.idSequence++;
      this.entities.push(entity);
      return entity;
    }

    const index = this.entities.findIndex((item) => item.id === entity.id);
    if (index >= 0) {
      this.entities[index] = entity;
    } else {
      this.entities.push(entity);
    }

    return entity;
  }

  async findOne(options?: FindOptions<T>): Promise<T | null> {
    if (!options?.where) {
      return this.entities[0] ?? null;
    }

    const matches = (entity: T, criteria: Partial<T>) =>
      Object.entries(criteria).every(
        ([key, value]) => (entity as Record<string, unknown>)[key] === value,
      );

    if (Array.isArray(options.where)) {
      return (
        this.entities.find((entity) =>
          options.where?.some((criteria) => matches(entity, criteria)),
        ) ?? null
      );
    }

    return this.entities.find((entity) => matches(entity, options.where!)) ?? null;
  }

  async find(): Promise<T[]> {
    return [...this.entities];
  }

  async remove(entity: T): Promise<T> {
    this.entities = this.entities.filter((item) => item.id !== entity.id);
    return entity;
  }
}

describe('E2E auth and core CRUD flows', () => {
  let app: INestApplication;
  let baseUrl: string;

  const usuarioRepository = new InMemoryRepository<Usuario>();
  const refreshTokenRepository = new InMemoryRepository<RefreshToken>();
  const gastoRepository = new InMemoryRepository<Gasto>();
  const ingresoRepository = new InMemoryRepository<Ingreso>();
  const personalRepository = new InMemoryRepository<PersonalAdministrativo>();

  const request = async (options: {
    method: string;
    path: string;
    token?: string;
    body?: Record<string, unknown>;
  }) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${baseUrl}${options.path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : undefined;

    return { status: response.status, body: data };
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        CacheModule.register({ isGlobal: true }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController, GastosController, IngresosController],
      providers: [
        AuthService,
        GastosService,
        IngresosService,
        JwtStrategy,
        JwtAuthGuard,
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: getRepositoryToken(Gasto),
          useValue: gastoRepository,
        },
        {
          provide: getRepositoryToken(Ingreso),
          useValue: ingresoRepository,
        },
        {
          provide: getRepositoryToken(PersonalAdministrativo),
          useValue: personalRepository,
        },
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

    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthorized access to protected endpoints', async () => {
    const response = await request({ method: 'GET', path: '/gastos' });
    expect(response.status).toBe(401);
  });

  it('executes auth and gastos/ingresos CRUD flows', async () => {
    const signupPayload = {
      nombre_apellido: 'Juan Perez',
      usuario: 'juan.perez',
      email: 'juan@example.com',
      telefono: '999999999',
      password: 'StrongPass1!',
    };

    const signupResponse = await request({
      method: 'POST',
      path: '/auth/signup',
      body: signupPayload,
    });

    expect(signupResponse.status).toBe(201);
    expect(signupResponse.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ usuario: signupPayload.usuario }),
      }),
    );

    const signInResponse = await request({
      method: 'POST',
      path: '/auth/signin',
      body: { usuario: signupPayload.usuario, password: signupPayload.password },
    });

    expect(signInResponse.status).toBe(201);
    expect(signInResponse.body.accessToken).toEqual(expect.any(String));

    const refreshResponse = await request({
      method: 'POST',
      path: '/auth/refresh',
      body: { refreshToken: signupResponse.body.refreshToken },
    });

    expect(refreshResponse.status).toBe(201);
    expect(refreshResponse.body.accessToken).toEqual(expect.any(String));

    const token = refreshResponse.body.accessToken as string;

    const gastoResponse = await request({
      method: 'POST',
      path: '/gastos',
      token,
      body: {
        fecha: '2024-01-15',
        item: 'Harina',
        motivo: 'Compra de insumos',
        monto: 120.5,
      },
    });

    expect(gastoResponse.status).toBe(201);
    expect(gastoResponse.body).toEqual(
      expect.objectContaining({ item: 'Harina', motivo: 'Compra de insumos' }),
    );

    const gastoId = gastoResponse.body.id as number;

    const gastoListResponse = await request({
      method: 'GET',
      path: '/gastos',
      token,
    });

    expect(gastoListResponse.status).toBe(200);
    expect(gastoListResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: gastoId, item: 'Harina' }),
      ]),
    );

    const gastoUpdateResponse = await request({
      method: 'PATCH',
      path: `/gastos/${gastoId}`,
      token,
      body: {
        item: 'Harina premium',
        monto: 150,
      },
    });

    expect(gastoUpdateResponse.status).toBe(200);
    expect(gastoUpdateResponse.body).toEqual(
      expect.objectContaining({ item: 'Harina premium', monto: 150 }),
    );

    const gastoDeleteResponse = await request({
      method: 'DELETE',
      path: `/gastos/${gastoId}`,
      token,
    });

    expect(gastoDeleteResponse.status).toBe(200);

    const gastoNotFoundResponse = await request({
      method: 'GET',
      path: `/gastos/${gastoId}`,
      token,
    });

    expect(gastoNotFoundResponse.status).toBe(404);

    const ingresoResponse = await request({
      method: 'POST',
      path: '/ingresos',
      token,
      body: {
        fecha: '2024-02-01',
        monto: 500,
      },
    });

    expect(ingresoResponse.status).toBe(201);
    expect(ingresoResponse.body).toEqual(
      expect.objectContaining({ monto: 500, fecha: '2024-02-01' }),
    );

    const ingresoId = ingresoResponse.body.id as number;

    const ingresoListResponse = await request({
      method: 'GET',
      path: '/ingresos',
      token,
    });

    expect(ingresoListResponse.status).toBe(200);
    expect(ingresoListResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ingresoId, monto: 500 }),
      ]),
    );

    const ingresoUpdateResponse = await request({
      method: 'PATCH',
      path: `/ingresos/${ingresoId}`,
      token,
      body: {
        monto: 720,
      },
    });

    expect(ingresoUpdateResponse.status).toBe(200);
    expect(ingresoUpdateResponse.body).toEqual(
      expect.objectContaining({ monto: 720 }),
    );

    const ingresoDeleteResponse = await request({
      method: 'DELETE',
      path: `/ingresos/${ingresoId}`,
      token,
    });

    expect(ingresoDeleteResponse.status).toBe(200);

    const ingresoNotFoundResponse = await request({
      method: 'GET',
      path: `/ingresos/${ingresoId}`,
      token,
    });

    expect(ingresoNotFoundResponse.status).toBe(404);
  });
});
