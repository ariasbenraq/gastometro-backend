import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDireccionTiendasIbk1722000000000
  implements MigrationInterface
{
  name = 'AddDireccionTiendasIbk1722000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "tiendas_ibk" ADD COLUMN "direccion" character varying(200)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "tiendas_ibk" DROP COLUMN "direccion"');
  }
}
