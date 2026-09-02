import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720881756312 implements MigrationInterface {
    name = 'Migration1720881756312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_710e2d4957aa5878dfe94e4ac2f" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_1f4b9818a08b822a31493fdee99" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_d42e0dcd4954bbebd2232624bd2" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "referenceId" varchar(255) NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_775c9f06fc27ae3ff8fb26f2c47" DEFAULT 'pending', "country" varchar(255) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255), "city" varchar(255) NOT NULL, "state" varchar(255) NOT NULL, "postalCode" varchar(255) NOT NULL, "completedAt" datetime, CONSTRAINT "UQ_2cc17bd14f982815e1115a38f47" UNIQUE ("referenceId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
