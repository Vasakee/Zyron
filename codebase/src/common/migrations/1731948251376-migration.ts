import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1731948251376 implements MigrationInterface {
    name = 'Migration1731948251376'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner" ADD "monthlyClients" varchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner" DROP COLUMN "monthlyClients"`);
    }

}
