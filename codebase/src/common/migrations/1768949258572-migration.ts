import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768949258572 implements MigrationInterface {
    name = 'Migration1768949258572'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-kits" ADD "registeredByUserId" uniqueidentifier`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order-kits" DROP COLUMN "registeredByUserId"`);
    }

}
