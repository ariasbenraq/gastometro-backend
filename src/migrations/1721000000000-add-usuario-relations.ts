import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsuarioRelations1721000000000 implements MigrationInterface {
  name = 'AddUsuarioRelations1721000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "gastos" ADD "usuario_id" integer NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "ingresos" ADD "usuario_id" integer NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "registro_movilidades" ADD "usuario_id" integer NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "personal_administrativo" ADD "usuario_id" integer NOT NULL',
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
