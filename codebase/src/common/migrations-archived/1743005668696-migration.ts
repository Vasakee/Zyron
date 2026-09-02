import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743005668696 implements MigrationInterface {
    name = 'Migration1743005668696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminders" ADD "status" varchar(255) CONSTRAINT CHK_523d9ad6f424db7ab289d337f8_ENUM CHECK(status IN ('pending','sent')) NOT NULL CONSTRAINT "DF_f1e2dfe3f1c1eb4814cafa0af8a" DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reminders" DROP CONSTRAINT "DF_f1e2dfe3f1c1eb4814cafa0af8a"`);
        await queryRunner.query(`ALTER TABLE "reminders" DROP COLUMN "status"`);
    }

}
