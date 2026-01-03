import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "roles_usuario" ("id" SERIAL NOT NULL, "nombre" character varying(100), CONSTRAINT "PK_0e95e4c69782295824fc69a9a1b" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "usuarios" ("id" SERIAL NOT NULL, "nombre_apellido" character varying(150) NOT NULL, "usuario" character varying(80), "email" character varying(150) NOT NULL, "telefono" character varying(50), "activo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "rol_id" integer, CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "registro_movilidades" ("id" SERIAL NOT NULL, "fecha" date NOT NULL, "inicio" character varying(120) NOT NULL, "fin" character varying(120) NOT NULL, "motivo" character varying(250) NOT NULL, "detalle" character varying(250) NOT NULL, "monto" numeric(12,2) NOT NULL, "ticket" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "tienda_id" integer, CONSTRAINT "PK_46e95364f209fdad28d4b53231a" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "tiendas_ibk" ("id" SERIAL NOT NULL, "codigo_tienda" character varying(50) NOT NULL, "nombre_tienda" character varying(150) NOT NULL, "distrito" character varying(100) NOT NULL, "provincia" character varying(100) NOT NULL, "departamento" character varying(100) NOT NULL, "estado_servicio_id" integer, CONSTRAINT "PK_76d1da2c5f24483ea9ac46d8b51" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "estado_servicio" ("id" SERIAL NOT NULL, "estado" character varying(100), CONSTRAINT "PK_047c450fe757c84d27bb1cc83df" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "ingresos" ("id" SERIAL NOT NULL, "fecha" date NOT NULL, "monto" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "depositado_por" integer, CONSTRAINT "PK_f851f15f02b7e2615c8d6d4e9d7" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "personal_administrativo" ("id" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_83e1368d7b2d07d382521d6ec5f" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE TABLE "gastos" ("id" SERIAL NOT NULL, "fecha" date NOT NULL, "item" character varying(150) NOT NULL, "motivo" character varying(250) NOT NULL, "monto" numeric(12,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "aprobado_por" integer, CONSTRAINT "PK_2b6965305b864a1ed8e6f6bf586" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD CONSTRAINT "FK_9e519760a660751f4fa21453d3e" FOREIGN KEY ("rol_id") REFERENCES "roles_usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_10d8644f0879d9e23cf15db212f" FOREIGN KEY ("tienda_id") REFERENCES "tiendas_ibk"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "tiendas_ibk" ADD CONSTRAINT "FK_d1d27ebebf250d8edb48a2829d2" FOREIGN KEY ("estado_servicio_id") REFERENCES "estado_servicio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" ADD CONSTRAINT "FK_c38b64a509e1ebeb13a337f9545" FOREIGN KEY ("depositado_por") REFERENCES "personal_administrativo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "gastos" ADD CONSTRAINT "FK_51731312b0ea296e72beb636271" FOREIGN KEY ("aprobado_por") REFERENCES "personal_administrativo"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "gastos" DROP CONSTRAINT "FK_51731312b0ea296e72beb636271"',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" DROP CONSTRAINT "FK_c38b64a509e1ebeb13a337f9545"',
    );
    await queryRunner.query(
      'ALTER TABLE "tiendas_ibk" DROP CONSTRAINT "FK_d1d27ebebf250d8edb48a2829d2"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT "FK_10d8644f0879d9e23cf15db212f"',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP CONSTRAINT "FK_9e519760a660751f4fa21453d3e"',
    );
    await queryRunner.query('DROP TABLE "gastos"');
    await queryRunner.query('DROP TABLE "personal_administrativo"');
    await queryRunner.query('DROP TABLE "ingresos"');
    await queryRunner.query('DROP TABLE "estado_servicio"');
    await queryRunner.query('DROP TABLE "tiendas_ibk"');
    await queryRunner.query('DROP TABLE "registro_movilidades"');
    await queryRunner.query('DROP TABLE "usuarios"');
    await queryRunner.query('DROP TABLE "roles_usuario"');
  }
}
