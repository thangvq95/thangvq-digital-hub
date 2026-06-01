import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategories1716660001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR UNIQUE NOT NULL
      );
    `);

    // Insert default categories
    await queryRunner.query(`
      INSERT INTO "categories" ("name") VALUES ('video'), ('memory'), ('skills'), ('finance');
    `);

    // Add category_id to repositories
    await queryRunner.query(`
      ALTER TABLE "repositories" ADD COLUMN "category_id" INTEGER;
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "repositories"
      ADD CONSTRAINT "FK_repositories_category_id"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "repositories" DROP CONSTRAINT IF EXISTS "FK_repositories_category_id";
    `);
    await queryRunner.query(`
      ALTER TABLE "repositories" DROP COLUMN IF EXISTS "category_id";
    `);
    await queryRunner.query(`
      DROP TABLE IF EXISTS "categories";
    `);
  }
}
