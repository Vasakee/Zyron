import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1741948012965 implements MigrationInterface {
    name = 'Migration1741948012965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shotgun-waitlist" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_1208e9abf301e3dc8db20aaa783" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_280353bad4107b2ce768d4179c8" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_0a8a50b2a7660a0008f694691fe" DEFAULT GETUTCDATE(), "referenceId" varchar(255) NOT NULL, "finalReferenceId" varchar(255), "stripeCustomerId" varchar(255) NOT NULL, "firstName" varchar(255) NOT NULL, "lastName" varchar(255), "email" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_2d0e2f9c60063c7aac8e662b759" DEFAULT 'pending', "country" varchar(255) NOT NULL, "addressLineOne" varchar(255) NOT NULL, "addressLineTwo" varchar(255), "city" varchar(255) NOT NULL, "state" varchar(255) NOT NULL, "postalCode" varchar(255) NOT NULL, "source" varchar(255) NOT NULL CONSTRAINT "DF_397b4bc80e01e49d6e1feaf4fdb" DEFAULT 'platform', "quantity" bigint NOT NULL CONSTRAINT "DF_aa1ce31b6d5a27abd4dcb6cf06e" DEFAULT 1, "completedAt" datetime, CONSTRAINT "UQ_d36d41b150980cf17d07ae8df8c" UNIQUE ("referenceId"), CONSTRAINT "UQ_087e83a7417dac096e0b73dc0cf" UNIQUE ("finalReferenceId"), CONSTRAINT "UQ_a13db816d5240b58a9425057eb7" UNIQUE ("stripeCustomerId"), CONSTRAINT "PK_1208e9abf301e3dc8db20aaa783" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "generated-kits" DROP COLUMN "barCode"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "userId" uniqueidentifier`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "addressLineOne" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "city" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "state" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "postalCode" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "postalCode" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "state" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "city" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "addressLineOne" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ALTER COLUMN "userId" uniqueidentifier NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "generated-kits" ADD "barCode" text`);
        await queryRunner.query(`DROP TABLE "shotgun-waitlist"`);
    }

}
