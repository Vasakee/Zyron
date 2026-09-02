import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1714290375665 implements MigrationInterface {
    name = 'Migration1714290375665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "practitioner" ADD "stateLocation" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD "zipCode" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "base_entity" DROP CONSTRAINT "DF_e4e1b9afb4ee5eae3c081579d09"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ADD CONSTRAINT "DF_e4e1b9afb4ee5eae3c081579d09" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "base_entity" DROP CONSTRAINT "DF_834d55ad4e3424101fb5842adfc"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ADD CONSTRAINT "DF_834d55ad4e3424101fb5842adfc" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "email" DROP CONSTRAINT "DF_5ea8f921c06295435d3e22b7117"`);
        await queryRunner.query(`ALTER TABLE "email" ADD CONSTRAINT "DF_5ea8f921c06295435d3e22b7117" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "email" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email" DROP CONSTRAINT "DF_4210d6d5d0689533f5a4cb31955"`);
        await queryRunner.query(`ALTER TABLE "email" ADD CONSTRAINT "DF_4210d6d5d0689533f5a4cb31955" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "DF_d39a6634701144f6163a5095add"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "DF_d39a6634701144f6163a5095add" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "DF_ffc77349f0345edbe4aeefcd02a"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "DF_ffc77349f0345edbe4aeefcd02a" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "DF_f192253eabdf3e7da5cc42e83f1"`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "DF_f192253eabdf3e7da5cc42e83f1" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "support" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "DF_720eda004c2f54552ba736a0cf0"`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "DF_720eda004c2f54552ba736a0cf0" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_e11e649824a45d8ed01d597fd93"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "DF_e11e649824a45d8ed01d597fd93" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_0dd2855b4e80af3cd66aeb04d71"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "DF_0dd2855b4e80af3cd66aeb04d71" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_929860826d58c66f8ed7598dc3b"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "DF_929860826d58c66f8ed7598dc3b" DEFAULT GETUTCDATE() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "tutorials" DROP CONSTRAINT "DF_bef4e44103663196a54cb3a90d8"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ADD CONSTRAINT "DF_bef4e44103663196a54cb3a90d8" DEFAULT GETUTCDATE() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tutorials" DROP CONSTRAINT "DF_3e56553e8ac1cacf0969897ccf9"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ADD CONSTRAINT "DF_3e56553e8ac1cacf0969897ccf9" DEFAULT GETUTCDATE() FOR "updatedAt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tutorials" DROP CONSTRAINT "DF_3e56553e8ac1cacf0969897ccf9"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ADD CONSTRAINT "DF_3e56553e8ac1cacf0969897ccf9" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tutorials" DROP CONSTRAINT "DF_bef4e44103663196a54cb3a90d8"`);
        await queryRunner.query(`ALTER TABLE "tutorials" ADD CONSTRAINT "DF_bef4e44103663196a54cb3a90d8" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_929860826d58c66f8ed7598dc3b"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "DF_929860826d58c66f8ed7598dc3b" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "kit" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "kit" DROP CONSTRAINT "DF_0dd2855b4e80af3cd66aeb04d71"`);
        await queryRunner.query(`ALTER TABLE "kit" ADD CONSTRAINT "DF_0dd2855b4e80af3cd66aeb04d71" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "DF_80ca6e6ef65fb9ef34ea8c90f42" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "DF_e11e649824a45d8ed01d597fd93"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "DF_e11e649824a45d8ed01d597fd93" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "DF_720eda004c2f54552ba736a0cf0"`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "DF_720eda004c2f54552ba736a0cf0" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "support" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "support" DROP CONSTRAINT "DF_f192253eabdf3e7da5cc42e83f1"`);
        await queryRunner.query(`ALTER TABLE "support" ADD CONSTRAINT "DF_f192253eabdf3e7da5cc42e83f1" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "DF_ffc77349f0345edbe4aeefcd02a"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "DF_ffc77349f0345edbe4aeefcd02a" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP CONSTRAINT "DF_d39a6634701144f6163a5095add"`);
        await queryRunner.query(`ALTER TABLE "practitioner" ADD CONSTRAINT "DF_d39a6634701144f6163a5095add" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "email" DROP CONSTRAINT "DF_4210d6d5d0689533f5a4cb31955"`);
        await queryRunner.query(`ALTER TABLE "email" ADD CONSTRAINT "DF_4210d6d5d0689533f5a4cb31955" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "email" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "email" DROP CONSTRAINT "DF_5ea8f921c06295435d3e22b7117"`);
        await queryRunner.query(`ALTER TABLE "email" ADD CONSTRAINT "DF_5ea8f921c06295435d3e22b7117" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "base_entity" DROP CONSTRAINT "DF_834d55ad4e3424101fb5842adfc"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ADD CONSTRAINT "DF_834d55ad4e3424101fb5842adfc" DEFAULT getdate() FOR "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ALTER COLUMN "updatedAt" datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE "base_entity" DROP CONSTRAINT "DF_e4e1b9afb4ee5eae3c081579d09"`);
        await queryRunner.query(`ALTER TABLE "base_entity" ADD CONSTRAINT "DF_e4e1b9afb4ee5eae3c081579d09" DEFAULT getdate() FOR "createdAt"`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP COLUMN "zipCode"`);
        await queryRunner.query(`ALTER TABLE "practitioner" DROP COLUMN "stateLocation"`);
    }

}
