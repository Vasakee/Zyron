import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1768939793448 implements MigrationInterface {
    name = 'Migration1768939793448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_invites" ADD "emailSentAt" datetime`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_invites" DROP COLUMN "emailSentAt"`);
    }

}
