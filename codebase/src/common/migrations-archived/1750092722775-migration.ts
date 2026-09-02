import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1750092722775 implements MigrationInterface {
    name = 'Migration1750092722775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "subPractitionerName" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "subPractitionerName"`);
    }

}
