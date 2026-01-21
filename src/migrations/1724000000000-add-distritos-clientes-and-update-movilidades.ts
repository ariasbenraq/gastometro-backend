import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDistritosClientesAndUpdateMovilidades1724000000000
  implements MigrationInterface
{
  name = 'AddDistritosClientesAndUpdateMovilidades1724000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "distritos_lima" (
        "id" SERIAL PRIMARY KEY,
        "nombre" character varying(100) NOT NULL,
        "ubigeo" character(6) NOT NULL,
        "codigo_postal_ref" character varying(10)
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "entidades_financieras" (
        "id" SERIAL PRIMARY KEY,
        "nombre" character varying(200) NOT NULL,
        "tipo" character varying(50) NOT NULL
      )`,
    );

    await queryRunner.query(
      `INSERT INTO "distritos_lima" ("nombre", "ubigeo", "codigo_postal_ref") VALUES
      ('Lima (Cercado de Lima)', '150101', 'Lima 01'),
      ('Ancón', '150102', 'Lima 02'),
      ('Ate', '150103', 'Lima 03'),
      ('Barranco', '150104', 'Lima 04'),
      ('Breña', '150105', 'Lima 05'),
      ('Carabayllo', '150106', 'Lima 06'),
      ('Comas', '150107', 'Lima 07'),
      ('Chaclacayo', '150108', 'Lima 08'),
      ('Chorrillos', '150109', 'Lima 09'),
      ('El Agustino', '150110', 'Lima 10'),
      ('Independencia', '150111', 'Lima 28'),
      ('Jesús María', '150112', 'Lima 11'),
      ('La Molina', '150113', 'Lima 12'),
      ('La Victoria', '150114', 'Lima 13'),
      ('Lince', '150115', 'Lima 14'),
      ('Los Olivos', '150116', 'Lima 39'),
      ('Lurigancho (Chosica)', '150117', 'Lima 15'),
      ('Lurín', '150118', 'Lima 16'),
      ('Magdalena del Mar', '150119', 'Lima 17'),
      ('Miraflores', '150120', 'Lima 18'),
      ('Pachacámac', '150121', 'Lima 19'),
      ('Pucusana', '150122', 'Lima 20'),
      ('Pueblo Libre', '150123', 'Lima 21'),
      ('Puente Piedra', '150124', 'Lima 22'),
      ('Punta Hermosa', '150125', 'Lima 24'),
      ('Punta Negra', '150126', 'Lima 23'),
      ('Rímac', '150127', 'Lima 25'),
      ('San Bartolo', '150128', 'Lima 26'),
      ('San Borja', '150129', 'Lima 41'),
      ('San Isidro', '150130', 'Lima 27'),
      ('San Juan de Lurigancho', '150131', 'Lima 36'),
      ('San Juan de Miraflores', '150132', 'Lima 29'),
      ('San Luis', '150133', 'Lima 30'),
      ('San Martín de Porres', '150134', 'Lima 31'),
      ('San Miguel', '150135', 'Lima 32'),
      ('Santa Anita', '150136', 'Lima 43'),
      ('Santa María del Mar', '150137', 'Lima 37'),
      ('Santa Rosa', '150138', 'Lima 38'),
      ('Santiago de Surco', '150139', 'Lima 33'),
      ('Surquillo', '150140', 'Lima 34'),
      ('Villa El Salvador', '150141', 'Lima 42'),
      ('Villa María del Triunfo', '150142', 'Lima 35')`,
    );

    await queryRunner.query(
      `INSERT INTO "entidades_financieras" ("nombre", "tipo") VALUES
      ('Banco de Crédito del Perú', 'Banco'),
      ('Banco BBVA Perú', 'Banco'),
      ('Interbank', 'Banco'),
      ('Scotiabank Perú', 'Banco'),
      ('Banco de la Nación', 'Banco'),
      ('Banco Interamericano de Finanzas (BanBif)', 'Banco'),
      ('Mibanco - Banco de la Microempresa', 'Banco'),
      ('Banco Pichincha del Perú', 'Banco'),
      ('Banco Santander Perú', 'Banco'),
      ('Citibank del Perú', 'Banco'),
      ('Banco GNB Perú', 'Banco'),
      ('Banco Falabella Perú', 'Banco'),
      ('Banco Ripley Perú', 'Banco'),
      ('Bank of China (Peru)', 'Banco'),
      ('ICBC Perú Bank', 'Banco'),
      ('BCI Perú S.A.', 'Banco'),
      ('Alfin Banco S.A.', 'Banco'),
      ('Caja Municipal de Ahorro y Crédito de Lima', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Arequipa', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Huancayo', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Piura', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Trujillo', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Cusco', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Ica', 'Caja Municipal'),
      ('Caja Municipal de Ahorro y Crédito de Maynas', 'Caja Municipal'),
      ('Caja Rural de Ahorro y Crédito Los Andes', 'Caja Rural')`,
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "inicio_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "fin_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "cliente_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "wo" character varying(100)',
    );

    await queryRunner.query(
      `UPDATE "registro_movilidades" rm
        SET "inicio_id" = d."id"
        FROM "distritos_lima" d
        WHERE LOWER(rm."inicio") = LOWER(d."nombre")
          AND rm."inicio_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades" rm
        SET "fin_id" = d."id"
        FROM "distritos_lima" d
        WHERE LOWER(rm."fin") = LOWER(d."nombre")
          AND rm."fin_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades"
        SET "inicio_id" = (SELECT "id" FROM "distritos_lima" ORDER BY "id" ASC LIMIT 1)
        WHERE "inicio_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades"
        SET "fin_id" = (SELECT "id" FROM "distritos_lima" ORDER BY "id" ASC LIMIT 1)
        WHERE "fin_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades"
        SET "cliente_id" = (SELECT "id" FROM "entidades_financieras" ORDER BY "id" ASC LIMIT 1)
        WHERE "cliente_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades"
        SET "wo" = "ticket"
        WHERE "wo" IS NULL`,
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ALTER COLUMN "inicio_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ALTER COLUMN "fin_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ALTER COLUMN "cliente_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ALTER COLUMN "wo" SET NOT NULL',
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "inicio"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "fin"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "ticket"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT IF EXISTS "FK_10d8644f0879d9e23cf15db212f"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "tienda_id"',
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_registro_inicio_distrito" FOREIGN KEY ("inicio_id") REFERENCES "distritos_lima"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_registro_fin_distrito" FOREIGN KEY ("fin_id") REFERENCES "distritos_lima"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_registro_cliente" FOREIGN KEY ("cliente_id") REFERENCES "entidades_financieras"("id") ON DELETE RESTRICT ON UPDATE NO ACTION',
    );

    await queryRunner.query('DROP TABLE IF EXISTS "tiendas_ibk" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "estado_servicio" CASCADE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT IF EXISTS "FK_registro_cliente"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT IF EXISTS "FK_registro_fin_distrito"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT IF EXISTS "FK_registro_inicio_distrito"',
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "wo"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "cliente_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "fin_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP COLUMN IF EXISTS "inicio_id"',
    );

    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "inicio" character varying(120) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "fin" character varying(120) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "ticket" character varying(100) NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD COLUMN "tienda_id" integer',
    );

    await queryRunner.query(
      `CREATE TABLE "estado_servicio" (
        "id" SERIAL NOT NULL,
        "estado" character varying(100),
        CONSTRAINT "PK_047c450fe757c84d27bb1cc83df" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "tiendas_ibk" (
        "id" SERIAL NOT NULL,
        "codigo_tienda" character varying(50) NOT NULL,
        "nombre_tienda" character varying(150) NOT NULL,
        "distrito" character varying(100) NOT NULL,
        "provincia" character varying(100) NOT NULL,
        "departamento" character varying(100) NOT NULL,
        "estado_servicio_id" integer,
        "direccion" character varying(200),
        CONSTRAINT "PK_76d1da2c5f24483ea9ac46d8b51" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      'ALTER TABLE "tiendas_ibk" ADD CONSTRAINT "FK_d1d27ebebf250d8edb48a2829d2" FOREIGN KEY ("estado_servicio_id") REFERENCES "estado_servicio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_10d8644f0879d9e23cf15db212f" FOREIGN KEY ("tienda_id") REFERENCES "tiendas_ibk"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_tiendas_ibk_codigo_tienda_trgm" ON "tiendas_ibk" USING GIN ("codigo_tienda" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_tiendas_ibk_nombre_tienda_trgm" ON "tiendas_ibk" USING GIN ("nombre_tienda" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_tiendas_ibk_distrito_trgm" ON "tiendas_ibk" USING GIN ("distrito" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_tiendas_ibk_provincia_trgm" ON "tiendas_ibk" USING GIN ("provincia" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_tiendas_ibk_departamento_trgm" ON "tiendas_ibk" USING GIN ("departamento" gin_trgm_ops)',
    );

    await queryRunner.query('DROP TABLE IF EXISTS "entidades_financieras"');
    await queryRunner.query('DROP TABLE IF EXISTS "distritos_lima"');
  }
}
