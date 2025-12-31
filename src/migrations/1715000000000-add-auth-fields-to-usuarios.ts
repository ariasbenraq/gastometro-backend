import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthFieldsToUsuarios1715000000000
  implements MigrationInterface
{
  name = 'AddAuthFieldsToUsuarios1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD COLUMN "password_hash" character varying(255)',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_usuarios_usuario" UNIQUE ("usuario")',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_usuarios_email" UNIQUE ("email")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_usuarios_email"',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_usuarios_usuario"',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP COLUMN "password_hash"',
    );
  }
}
