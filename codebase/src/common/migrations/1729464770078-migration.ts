import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729464770078 implements MigrationInterface {
    name = 'Migration1729464770078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "support-message" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_fe75c726478e5fbb707083d5184" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_fda13e81418d85601698b7f9e44" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_9d5b1ed39defbbd5223d9f88109" DEFAULT GETUTCDATE(), "userId" uniqueidentifier NOT NULL, "content" text NOT NULL, "supportId" uniqueidentifier NOT NULL, "sender" varchar(255) NOT NULL, "status" varchar(255) NOT NULL CONSTRAINT "DF_7404e5bc702df17a0b6eeec9d11" DEFAULT 'pending', CONSTRAINT "PK_fe75c726478e5fbb707083d5184" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "support" ADD "messageId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "expectedDeliveryDate" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "dateDelivered" datetime`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "delivered" varchar(255) NOT NULL CONSTRAINT "DF_b78ccdf54ff3773e3f7c2314135" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "kitId" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "shippingDate" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "trackingNumber" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "expectedDeliveryDate" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "dateDelivered" datetime`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "delivered" varchar(255) NOT NULL CONSTRAINT "DF_e69c52f5b62c8bd56d7a2418e6d" DEFAULT 'no'`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "country" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "addressLineOne" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "addressLineTwo" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "city" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "state" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shippings" ADD "postalCode" varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b" FOREIGN KEY ("supportId") REFERENCES "support"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "support-message" ADD CONSTRAINT "FK_56ad27bb54beb49c06963114168" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "FK_56ad27bb54beb49c06963114168"`);
        await queryRunner.query(`ALTER TABLE "support-message" DROP CONSTRAINT "FK_93b7466b22df5e3d8b26eff041b"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "addressLineTwo"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "addressLineOne"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP CONSTRAINT "DF_e69c52f5b62c8bd56d7a2418e6d"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "delivered"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "dateDelivered"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "expectedDeliveryDate"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "trackingNumber"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "shippingDate"`);
        await queryRunner.query(`ALTER TABLE "shippings" DROP COLUMN "kitId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "DF_b78ccdf54ff3773e3f7c2314135"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "delivered"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "dateDelivered"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "expectedDeliveryDate"`);
        await queryRunner.query(`ALTER TABLE "support" DROP COLUMN "messageId"`);
        await queryRunner.query(`DROP TABLE "support-message"`);
    }

}
