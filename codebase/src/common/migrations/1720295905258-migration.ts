import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720295905258 implements MigrationInterface {
    name = 'Migration1720295905258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cancelled-transactions" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_9d4ed9126954148c5449bea477d" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_03558d1eb96b5b71dfb640eb9c2" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_003df596f998d9b43e667e44e2e" DEFAULT GETUTCDATE(), "paymentIntentId" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, CONSTRAINT "UQ_ac022f96c981cca030eac773b09" UNIQUE ("paymentIntentId"), CONSTRAINT "PK_9d4ed9126954148c5449bea477d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shippings" ("id" uniqueidentifier NOT NULL CONSTRAINT "DF_665fb613135782a598a2b47e5b2" DEFAULT NEWSEQUENTIALID(), "createdAt" datetime NOT NULL CONSTRAINT "DF_eba76eedd371c368dfcebe27788" DEFAULT GETUTCDATE(), "updatedAt" datetime NOT NULL CONSTRAINT "DF_69084e410746ec14576324a74e6" DEFAULT GETUTCDATE(), "fullName" varchar(255) NOT NULL, "paymentIntentId" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "status" nvarchar(255) NOT NULL CONSTRAINT "DF_df57641a0bf20dd3f254a508b05" DEFAULT 'pending', "completedAt" datetime, CONSTRAINT "UQ_150a38cc5ae8084ce38fc28e7e9" UNIQUE ("paymentIntentId"), CONSTRAINT "PK_665fb613135782a598a2b47e5b2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "shippings"`);
        await queryRunner.query(`DROP TABLE "cancelled-transactions"`);
    }

}
