import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741949229861 implements MigrationInterface {
    name = 'Migration1741949229861'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "UQ_087e83a7417dac096e0b73dc0cf"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "UQ_a13db816d5240b58a9425057eb7"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD CONSTRAINT "UQ_a13db816d5240b58a9425057eb7" UNIQUE ("stripeCustomerId")`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD CONSTRAINT "UQ_087e83a7417dac096e0b73dc0cf" UNIQUE ("finalReferenceId")`);
    }

}
