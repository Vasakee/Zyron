import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768332089050 implements MigrationInterface {
    name = 'Migration1768332089050'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryMode" varchar(255) NOT NULL CONSTRAINT "DF_ced3ade9e2b0000212c8cbf5098" DEFAULT 'dropship'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_ced3ade9e2b0000212c8cbf5098"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryMode"`);
    }

}
