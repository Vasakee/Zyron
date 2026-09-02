import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738229237575 implements MigrationInterface {
    name = 'Migration1738229237575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`EXEC sp_rename "db_a9a5b5_staging.dbo.payment-methods.is_default", "isDefault"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "DF_a28744a177aba1dab620384be54"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD CONSTRAINT "DF_21f8ded2743573f3582d6fce46d" DEFAULT 0 FOR "isDefault"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "DF_21f8ded2743573f3582d6fce46d"`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD CONSTRAINT "DF_a28744a177aba1dab620384be54" DEFAULT 0 FOR "isDefault"`);
        await queryRunner.query(`EXEC sp_rename "db_a9a5b5_staging.dbo.payment-methods.isDefault", "is_default"`);
    }

}
