import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729010297782 implements MigrationInterface {
    name = 'Migration1729010297782'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "source" varchar(255) NOT NULL CONSTRAINT "DF_c7b5cc780cac8baa5465eeee953" DEFAULT 'platform'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_c7b5cc780cac8baa5465eeee953"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "source"`);
    }

}
