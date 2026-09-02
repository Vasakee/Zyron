import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741948883957 implements MigrationInterface {
    name = 'Migration1741948883957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "addressLineOne" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "city" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "state" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "postalCode" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "postalCode" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "state" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "city" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shotgun-waitlist" ALTER COLUMN "addressLineOne" varchar(255) NOT NULL`);
    }

}
