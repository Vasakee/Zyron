import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768249737870 implements MigrationInterface {
    name = 'Migration1768249737870'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "registeredViaAuto" bit NOT NULL CONSTRAINT "DF_0a83867437eb696741fb190e085" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "DF_0a83867437eb696741fb190e085"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "registeredViaAuto"`);
    }

}
