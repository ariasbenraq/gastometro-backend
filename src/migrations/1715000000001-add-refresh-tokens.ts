import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokens1715000000001 implements MigrationInterface {
  name = 'AddRefreshTokens1715000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "refresh_tokens" ("id" SERIAL NOT NULL, "usuario_id" integer NOT NULL, "token_hash" character varying(255) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "last_used_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_usuario" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_usuario"',
    );
    await queryRunner.query('DROP TABLE "refresh_tokens"');
  }
}
