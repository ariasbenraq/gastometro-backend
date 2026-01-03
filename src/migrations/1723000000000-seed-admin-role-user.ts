import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAdminRoleUser1723000000000 implements MigrationInterface {
  name = 'SeedAdminRoleUser1723000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "roles_usuario" ("nombre")
      SELECT role
      FROM (VALUES ('ADMIN'), ('ANALYST_BALANCE'), ('USER')) AS roles(role)
      WHERE NOT EXISTS (
        SELECT 1 FROM "roles_usuario" ru WHERE ru."nombre" = roles.role
      )
    `);

    await queryRunner.query(`
      INSERT INTO "usuarios" (
        "nombre_apellido",
        "usuario",
        "email",
        "telefono",
        "activo",
        "created_at",
        "rol_id",
        "password_hash"
      )
      SELECT
        'Administrador',
        'admin',
        'admin@gastometro.local',
        NULL,
        true,
        now(),
        (SELECT "id" FROM "roles_usuario" WHERE "nombre" = 'ADMIN' LIMIT 1),
        '$2a$10$Qqyt2qkNWICOZiGkkuHigu5Ormhowek70Fah7H3Ac6MANhrZT8O6W'
      WHERE NOT EXISTS (
        SELECT 1 FROM "usuarios"
        WHERE "usuario" = 'admin' OR "email" = 'admin@gastometro.local'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "usuarios"
      WHERE "usuario" = 'admin' OR "email" = 'admin@gastometro.local'
    `);

    await queryRunner.query(`
      DELETE FROM "roles_usuario"
      WHERE "nombre" IN ('ADMIN', 'ANALYST_BALANCE', 'USER')
        AND "id" NOT IN (
          SELECT DISTINCT "rol_id" FROM "usuarios" WHERE "rol_id" IS NOT NULL
        )
    `);
  }
}
