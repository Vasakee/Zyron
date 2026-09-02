import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1724224455166 implements MigrationInterface {
    name = 'Migration1724224455166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "referenceEmail" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "awarenessChannel" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "satisfaction" int`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "satisfaction" int NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "awarenessChannel" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "referenceEmail" varchar(255) NOT NULL`);
    }

}
