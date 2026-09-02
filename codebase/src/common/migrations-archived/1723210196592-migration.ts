import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1723210196592 implements MigrationInterface {
    name = 'Migration1723210196592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "generated-kits" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_29c5b001541ba76e91a4a04a82f" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_2b8777d7541a78db090ff519ced" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_b1c30b30300d5b4346d03c53a19" DEFAULT GETUTCDATE(), "kitId" varchar(255) NOT NULL, "qrCode" varchar(255) NOT NULL, CONSTRAINT "PK_29c5b001541ba76e91a4a04a82f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "generated-kits"`);
    }

}
