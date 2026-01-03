import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioRelations1721000000000 implements MigrationInterface {
  name = 'AddUsuarioRelations1721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "gastos" ADD "usuario_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" ADD "usuario_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD "usuario_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "personal_administrativo" ADD "usuario_id" integer',
    );
    await queryRunner.query(
      'ALTER TABLE "gastos" ADD CONSTRAINT "FK_gastos_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" ADD CONSTRAINT "FK_ingresos_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD CONSTRAINT "FK_registro_movilidades_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "personal_administrativo" ADD CONSTRAINT "FK_personal_administrativo_usuario_id" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM "usuarios") THEN
          RAISE EXCEPTION 'No hay usuarios existentes para asignar usuario_id.';
        END IF;
      END
      $$;`,
    );
    await queryRunner.query(
      `UPDATE "gastos"
      SET "usuario_id" = (SELECT "id" FROM "usuarios" ORDER BY "id" LIMIT 1)
      WHERE "usuario_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "ingresos"
      SET "usuario_id" = (SELECT "id" FROM "usuarios" ORDER BY "id" LIMIT 1)
      WHERE "usuario_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "registro_movilidades"
      SET "usuario_id" = (SELECT "id" FROM "usuarios" ORDER BY "id" LIMIT 1)
      WHERE "usuario_id" IS NULL`,
    );
    await queryRunner.query(
      `UPDATE "personal_administrativo"
      SET "usuario_id" = (SELECT "id" FROM "usuarios" ORDER BY "id" LIMIT 1)
      WHERE "usuario_id" IS NULL`,
    );
    await queryRunner.query(
      'ALTER TABLE "gastos" ALTER COLUMN "usuario_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" ALTER COLUMN "usuario_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ALTER COLUMN "usuario_id" SET NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "personal_administrativo" ALTER COLUMN "usuario_id" SET NOT NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "personal_administrativo" DROP CONSTRAINT "FK_personal_administrativo_usuario_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" DROP CONSTRAINT "FK_registro_movilidades_usuario_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" DROP CONSTRAINT "FK_ingresos_usuario_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "gastos" DROP CONSTRAINT "FK_gastos_usuario_id"',
    );
    await queryRunner.query('ALTER TABLE "personal_administrativo" DROP COLUMN "usuario_id"');
    await queryRunner.query('ALTER TABLE "registro_movilidades" DROP COLUMN "usuario_id"');
    await queryRunner.query('ALTER TABLE "ingresos" DROP COLUMN "usuario_id"');
    await queryRunner.query('ALTER TABLE "gastos" DROP COLUMN "usuario_id"');
  }
}
