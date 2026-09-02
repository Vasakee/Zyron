import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1759262220543 implements MigrationInterface {
    name = 'Migration1759262220543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" ALTER COLUMN "periodStart" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ALTER COLUMN "periodEnd" date NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_statements" ALTER COLUMN "periodEnd" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment_statements" ALTER COLUMN "periodStart" datetime NOT NULL`);
    }

}
