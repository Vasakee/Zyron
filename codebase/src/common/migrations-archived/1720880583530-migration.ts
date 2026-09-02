import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720880583530 implements MigrationInterface {
    name = 'Migration1720880583530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "order" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_1031171c13130102495201e3e20" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_7bb07d3c6e225d75d8418380f11" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_23db16cabddb9d10a73b5287bf8" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "referenceId" varchar(255) NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_7a9573d6a1fb982772a91233205" DEFAULT 'pending', "country" varchar(255) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255) NOT NULL, "city" varchar(255) NOT NULL, "state" varchar(255) NOT NULL, "postalCode" varchar(255) NOT NULL, "completedAt" datetime, CONSTRAINT "UQ_19d50b758e238b60a6874466650" UNIQUE ("referenceId"), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`DROP TABLE "order"`);
    }

}
