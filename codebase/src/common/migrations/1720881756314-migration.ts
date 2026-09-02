import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720881756314 implements MigrationInterface {
  name = "Migration1720881756314";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id" uniqueidentifier NOT NULL
          CONSTRAINT "DF_transactions_id" DEFAULT NEWSEQUENTIALID(),
        "createdAt" datetime NOT NULL
          CONSTRAINT "DF_transactions_createdAt" DEFAULT GETUTCDATE(),
        "updatedAt" datetime NOT NULL
          CONSTRAINT "DF_transactions_updatedAt" DEFAULT GETUTCDATE(),
        "referenceId" varchar(255) NOT NULL,
        "userId" uniqueidentifier NOT NULL,
        "type" varchar(255) NOT NULL
          CONSTRAINT "DF_transactions_type" DEFAULT 'pay',
        "status" varchar(255) NOT NULL
          CONSTRAINT "DF_transactions_status" DEFAULT 'pending',
        "gateway" varchar(255) NOT NULL
          CONSTRAINT "DF_transactions_gateway" DEFAULT 'stripe',
        "metadata" nvarchar(max) NOT NULL,
        CONSTRAINT "UQ_transactions_referenceId" UNIQUE ("referenceId"),
        CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "transactions"
      ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"
      FOREIGN KEY ("userId") REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
  }
}
