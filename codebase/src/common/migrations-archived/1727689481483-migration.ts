import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1727689481483 implements MigrationInterface {
    name = 'Migration1727689481483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b"`);
        await queryRunner.query(`ALTER TABLE "support-message" DROP COLUMN "supportId"`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD "supportId" varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" DROP COLUMN "supportId"`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD "supportId" uniqueidentifier NOT NULL`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b" FOREIGN KEY ("supportId") REFERENCES "support"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
