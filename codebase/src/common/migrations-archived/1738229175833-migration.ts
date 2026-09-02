import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738229175833 implements MigrationInterface {
    name = 'Migration1738229175833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`EXEC sp_rename "db_a9a5b5_staging.dbo.payment-methods.customerId", "is_default"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP COLUMN "is_default"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD "is_default" bit NOT NULL CONSTRAINT "DF_a28744a177aba1dab620384be54" DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "DF_a28744a177aba1dab620384be54"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP COLUMN "is_default"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD "is_default" varchar(255)`);
        await queryRunner.query(`EXEC sp_rename "db_a9a5b5_staging.dbo.payment-methods.is_default", "customerId"`);
    }

}
