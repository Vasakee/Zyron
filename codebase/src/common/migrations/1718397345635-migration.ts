import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1718397345635 implements MigrationInterface {
    name = 'Migration1718397345635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD CONSTRAINT "FK_7d56102d1bae1a5747d02ba00bb" FOREIGN KEY ("practitionerId") REFERENCES "practitioner"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner-kits" DROP CONSTRAINT "FK_7d56102d1bae1a5747d02ba00bb"`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD "userId" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "practitioner-kits" ADD CONSTRAINT "FK_bc5f62d07c0f5ac1e1197cbf366" FOREIGN KEY ("userId") REFERENCES "practitioner"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
