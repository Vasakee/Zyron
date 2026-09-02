import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1720881756313 implements MigrationInterface {
  name = 'Migration1720881756313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "payment-methods" (
                "id" uniqueidentifier NOT NULL
                    CONSTRAINT "DF_payment_methods_id" DEFAULT NEWSEQUENTIALID(),
                "createdAt" datetime NOT NULL
                    CONSTRAINT "DF_payment_methods_createdAt" DEFAULT GETUTCDATE(),
                "updatedAt" datetime NOT NULL
                    CONSTRAINT "DF_payment_methods_updatedAt" DEFAULT GETUTCDATE(),
                "userId" uniqueidentifier NOT NULL,
                "providerId" varchar(255) NOT NULL,
                "provider" varchar(255) NOT NULL,
                "metadata" nvarchar(max) NOT NULL,
                "type" varchar(255) NOT NULL
                    CONSTRAINT "DF_payment_methods_type" DEFAULT 'card',
                CONSTRAINT "PK_payment_methods_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "payment-methods"
            ADD CONSTRAINT "FK_payment_methods_user"
            FOREIGN KEY ("userId") REFERENCES "user"("id")
            ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "payment-methods"
            DROP CONSTRAINT "FK_payment_methods_user"
        `);

    await queryRunner.query(`
            DROP TABLE "payment-methods"
        `);
  }
}
