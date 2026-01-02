import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSearchIndexes1720000000000 implements MigrationInterface {
  name = 'AddSearchIndexes1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
    await queryRunner.query('CREATE INDEX "IDX_gastos_fecha" ON "gastos" ("fecha")');
    await queryRunner.query('CREATE INDEX "IDX_ingresos_fecha" ON "ingresos" ("fecha")');
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_fecha" ON "registro_movilidades" ("fecha")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_gastos_item_trgm" ON "gastos" USING GIN ("item" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_gastos_motivo_trgm" ON "gastos" USING GIN ("motivo" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_personal_administrativo_nombre_trgm" ON "personal_administrativo" USING GIN ("nombre" gin_trgm_ops)',
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
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_inicio_trgm" ON "registro_movilidades" USING GIN ("inicio" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_fin_trgm" ON "registro_movilidades" USING GIN ("fin" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_motivo_trgm" ON "registro_movilidades" USING GIN ("motivo" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_detalle_trgm" ON "registro_movilidades" USING GIN ("detalle" gin_trgm_ops)',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_registro_movilidades_ticket_trgm" ON "registro_movilidades" USING GIN ("ticket" gin_trgm_ops)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_ticket_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_detalle_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_motivo_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_fin_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_inicio_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_tiendas_ibk_departamento_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_tiendas_ibk_provincia_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_tiendas_ibk_distrito_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_tiendas_ibk_nombre_tienda_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_tiendas_ibk_codigo_tienda_trgm"');
    await queryRunner.query(
      'DROP INDEX "public"."IDX_personal_administrativo_nombre_trgm"',
    );
    await queryRunner.query('DROP INDEX "public"."IDX_gastos_motivo_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_gastos_item_trgm"');
    await queryRunner.query('DROP INDEX "public"."IDX_registro_movilidades_fecha"');
    await queryRunner.query('DROP INDEX "public"."IDX_ingresos_fecha"');
    await queryRunner.query('DROP INDEX "public"."IDX_gastos_fecha"');
  }
}
