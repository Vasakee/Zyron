import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1714896775244 implements MigrationInterface {
    name = 'Migration1714896775244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exPractitioner" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_b7e788ee968a7869d7431a77b3f" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_f4a1f5fd90682b916944f448394" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_ea271d54d9aec6fd42f3c97ddea" DEFAULT GETUTCDATE(), "userId" uniqueidentifier, "lastName" varchar(255), "email" varchar(255), "firstName" varchar(255), "websiteUrl" varchar(255), "phone" varchar(255), CONSTRAINT "PK_b7e788ee968a7869d7431a77b3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "REL_d57c3bb20f3ba2a1f09705046d" ON "exPractitioner" ("userId") WHERE "userId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "practitionerName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "practitionerEmail"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "websiteUrl"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "lastName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "email" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "firstName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "websiteUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "phone" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "practiceLastName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "practiceEmail" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "practiceFirstName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "practiceWebsiteUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "degree" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "status" varchar(255) NOT NULL CONSTRAINT "DF_46027276cd691be4dc8fea94312" DEFAULT 'under-review'`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "gutTestUse" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "gutTestUsedName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "practitionerType" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "countryLocation" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "stateLocation" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "cityLocation" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "zipCode" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD CONSTRAINT "FK_d57c3bb20f3ba2a1f09705046dc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP CONSTRAINT "FK_d57c3bb20f3ba2a1f09705046dc"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "zipCode"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "cityLocation"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "stateLocation"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "countryLocation"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "practitionerType"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "gutTestUsedName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "gutTestUse"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP CONSTRAINT "DF_46027276cd691be4dc8fea94312"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "degree"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "practiceWebsiteUrl"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "practiceFirstName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "practiceEmail"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "practiceLastName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "websiteUrl"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "phone" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "websiteUrl" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "firstName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "email" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "exPractitioner" ADD "lastName" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "practitionerEmail" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "practitionerName" varchar(255)`);
        await queryRunner.query(`DROP INDEX "REL_d57c3bb20f3ba2a1f09705046d" ON "exPractitioner"`);
        await queryRunner.query(`DROP TABLE "exPractitioner"`);
    }

}
