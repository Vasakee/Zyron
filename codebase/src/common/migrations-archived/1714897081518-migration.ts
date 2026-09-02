import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1714897081518 implements MigrationInterface {
    name = 'Migration1714897081518'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "external_practitioner" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a886ad8cb844fa776a5a1568737" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_686e255094ab98b1cbf82ac2824" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_8c36c105807475702363a646c0d" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "lastName" varchar(255), "email" varchar(255), "firstName" varchar(255), "websiteUrl" varchar(255), "phone" varchar(255), CONSTRAINT "PK_a886ad8cb844fa776a5a1568737" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_7f73b8dfc239d61edd801306b1" ON "external_practitioner" ("userId") WHERE "userId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "external_practitioner" ADD CONSTRAINT "FK_7f73b8dfc239d61edd801306b12" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "external_practitioner" DROP CONSTRAINT "FK_7f73b8dfc239d61edd801306b12"`);
        await queryRunner.query(`DROP INDEX "REL_7f73b8dfc239d61edd801306b1" ON "external_practitioner"`);
        await queryRunner.query(`DROP TABLE "external_practitioner"`);
    }

}
