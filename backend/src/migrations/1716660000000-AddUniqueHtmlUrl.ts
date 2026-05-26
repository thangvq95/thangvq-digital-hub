import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueHtmlUrl1716660000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove existing duplicate URLs before creating the unique constraint.
    // Keep the oldest row for each html_url to preserve first_seen_at semantics.
    await queryRunner.query(`
      DELETE FROM "repositories"
      WHERE "full_name" IN (
        SELECT "full_name"
        FROM (
          SELECT
            "full_name",
            ROW_NUMBER() OVER (
              PARTITION BY "html_url"
              ORDER BY "first_seen_at" ASC NULLS LAST, "updated_at" ASC NULLS LAST, "full_name" ASC
            ) AS rn
          FROM "repositories"
          WHERE "html_url" IS NOT NULL
        ) duplicates
        WHERE duplicates.rn > 1
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "repositories"
      ADD CONSTRAINT "UQ_unique_html_url" UNIQUE ("html_url");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "repositories"
      DROP CONSTRAINT IF EXISTS "UQ_unique_html_url";
    `);
  }
}
