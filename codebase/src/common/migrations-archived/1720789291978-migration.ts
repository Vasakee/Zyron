import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720789291978 implements MigrationInterface {
    name = 'Migration1720789291978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_a219afd8dd77ed80f5a862f1db9" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_e744417ceb0b530285c08f38655" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_a8b845c586db06b6558276e0bf6" DEFAULT GETUTCDATE(), "referenceId" varchar(255) NOT NULL, "userId" uniqueidentifier NOT NULL, "type" varchar(255) NOT NULL CONSTRAINT "DF_2d5fa024a84dceb158b2b95f34b" DEFAULT 'pay', "status" varchar(255) NOT NULL CONSTRAINT "DF_da87c55b3bbbe96c6ed88ea7ee4" DEFAULT 'pending', "gateway" varchar(255) NOT NULL CONSTRAINT "DF_445630fdd4eb652fa7ae86539fd" DEFAULT 'stripe', "metadata" nvarchar(max) NOT NULL, CONSTRAINT "UQ_8ca2fddf4ca18ce7429730ff20e" UNIQUE ("referenceId"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_710e2d4957aa5878dfe94e4ac2f" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_1f4b9818a08b822a31493fdee99" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_d42e0dcd4954bbebd2232624bd2" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255) NOT NULL, "clientEmail" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_775c9f06fc27ae3ff8fb26f2c47" DEFAULT 'pending', "country" varchar(255) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255) NOT NULL, "city" varchar(255) NOT NULL, "state" varchar(255) NOT NULL, "postalCode" varchar(255) NOT NULL, "completedAt" datetime, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment-methods" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_ebcd8bd4203e7ac1d0cc1ff0f25" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_493c00e813b247a7a57342d7a1a" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_b46e8f6814be761a67501c34821" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "providerId" varchar(255) NOT NULL, "provider" varchar(255) NOT NULL, "metadata" nvarchar(max) NOT NULL, "type" varchar(255) NOT NULL CONSTRAINT "DF_e0d19ddde67fbf7a2291ab09efc" DEFAULT 'card', CONSTRAINT "PK_ebcd8bd4203e7ac1d0cc1ff0f25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment-methods" ADD CONSTRAINT "FK_05347faefe7d008d46ee5d1d531" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment-methods" DROP CONSTRAINT "FK_05347faefe7d008d46ee5d1d531"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
        await queryRunner.query(`DROP TABLE "payment-methods"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
