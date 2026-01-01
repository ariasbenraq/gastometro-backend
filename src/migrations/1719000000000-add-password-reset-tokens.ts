import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordResetTokens1719000000000
  implements MigrationInterface
{
  name = 'AddPasswordResetTokens1719000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "password_reset_tokens" ("id" SERIAL NOT NULL, "usuario_id" integer NOT NULL, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_password_reset_tokens_usuario_id" ON "password_reset_tokens" ("usuario_id")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_password_reset_tokens_expires_at" ON "password_reset_tokens" ("expires_at")',
    );
    await queryRunner.query(
      'ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "FK_password_reset_tokens_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_password_reset_tokens_usuario"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_password_reset_tokens_expires_at"',
    );
    await queryRunner.query(
      'DROP INDEX "public"."IDX_password_reset_tokens_usuario_id"',
    );
    await queryRunner.query('DROP TABLE "password_reset_tokens"');
  }
}
