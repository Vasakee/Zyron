import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1717326021185 implements MigrationInterface {
    name = 'Migration1717326021185'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_e032310bcef831fb83101899b10" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_bcde1bb6334ec26b409138ff860" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_29c3c1da0a5d0de91aa77976caa" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "permissions" ntext NOT NULL, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_f8a889c4362d78f056960ca6da" ON "admin" ("userId") WHERE "userId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" DROP CONSTRAINT "FK_f8a889c4362d78f056960ca6dad"`);
        await queryRunner.query(`DROP INDEX "REL_f8a889c4362d78f056960ca6da" ON "admin"`);
        await queryRunner.query(`DROP TABLE "admin"`);
    }

}
