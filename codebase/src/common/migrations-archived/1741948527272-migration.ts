import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741948527272 implements MigrationInterface {
    name = 'Migration1741948527272'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "DF_397b4bc80e01e49d6e1feaf4fdb"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD CONSTRAINT "DF_397b4bc80e01e49d6e1feaf4fdb" DEFAULT 'waitlist' FOR "source"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" DROP CONSTRAINT "DF_397b4bc80e01e49d6e1feaf4fdb"`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ADD CONSTRAINT "DF_397b4bc80e01e49d6e1feaf4fdb" DEFAULT 'platform' FOR "source"`);
    }

}
