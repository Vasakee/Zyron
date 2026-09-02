import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1714908175880 implements MigrationInterface {
    name = 'Migration1714908175880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "client_practitioner" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_7827cd34e55a53eb9c6767a3dfc" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_8ce03f5fc3b5b27a6f17bd5472d" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_a7fa5b96193c77ee71cca761ccc" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "practitionerId" uniqueidentifier, "reportAccess" varchar(255) NOT NULL CONSTRAINT "DF_12e507be08749fcac88e3115c9e" DEFAULT 'declined', CONSTRAINT "PK_7827cd34e55a53eb9c6767a3dfc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "practitioner_acsess" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_8ba8d31d8f7e7f98fa57163992e" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_10b3a98cdf863312149cb671507" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_4199f81306138bf25867e601851" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "practitionerId" uniqueidentifier, "reportAccess" varchar(255) NOT NULL CONSTRAINT "DF_b18c13951f471fcfe3556e81e35" DEFAULT 'declined', CONSTRAINT "PK_8ba8d31d8f7e7f98fa57163992e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "practitionerId"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_1c5829aea2d91923802c4b39fce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" ADD CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66" FOREIGN KEY ("practitionerId") REFERENCES "practitioner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practitioner_acsess" ADD CONSTRAINT "FK_3df9db1b3459725455ab2309cfa" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practitioner_acsess" ADD CONSTRAINT "FK_294ce684131c3a274dea79b77d4" FOREIGN KEY ("practitionerId") REFERENCES "practitioner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner_acsess" DROP CONSTRAINT "FK_294ce684131c3a274dea79b77d4"`);
        await queryRunner.query(`ALTER TABLE "practitioner_acsess" DROP CONSTRAINT "FK_3df9db1b3459725455ab2309cfa"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_fd178f1397ff3133fee8f8faa66"`);
        await queryRunner.query(`ALTER TABLE "client_practitioner" DROP CONSTRAINT "FK_1c5829aea2d91923802c4b39fce"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "practitionerId" varchar(255)`);
        await queryRunner.query(`DROP TABLE "practitioner_acsess"`);
        await queryRunner.query(`DROP TABLE "client_practitioner"`);
    }

}
