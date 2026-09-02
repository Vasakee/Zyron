import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717855440930 implements MigrationInterface {
    name = 'Migration1717855440930'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "FK_51594f622313b4dc85d7b31cc9a"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "FK_51594f622313b4dc85d7b31cc9a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "FK_51594f622313b4dc85d7b31cc9a"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "FK_51594f622313b4dc85d7b31cc9a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
