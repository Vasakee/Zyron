import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741948761198 implements MigrationInterface {
    name = 'Migration1741948761198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "stripeCustomerId" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "stripeCustomerId" varchar(255) NOT NULL`);
    }

}
