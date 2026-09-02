import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1724070606518 implements MigrationInterface {
    name = 'Migration1724070606518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "status" varchar(255) NOT NULL CONSTRAINT "DF_3d44ccf43b8a0d6b9978affb880" DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_3d44ccf43b8a0d6b9978affb880"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "status"`);
    }

}
