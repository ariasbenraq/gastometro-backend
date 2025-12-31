import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureUsuarioAuthColumns1715000000002
  implements MigrationInterface
{
  name = 'EnsureUsuarioAuthColumns1715000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "password_hash" character varying(255)',
    );

    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_usuarios_usuario'
        ) THEN
          ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_usuarios_usuario" UNIQUE ("usuario");
        END IF;
      END$$;`,
    );

    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_usuarios_email'
        ) THEN
          ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_usuarios_email" UNIQUE ("email");
        END IF;
      END$$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "UQ_usuarios_email"',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "UQ_usuarios_usuario"',
    );
    await queryRunner.query(
      'ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "password_hash"',
    );
  }
}
