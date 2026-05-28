import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueHtmlUrl1716660000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Deduplicate repositories by html_url.
    // We group by html_url and keep the first one based on a custom score (preferring those with user state).
    await queryRunner.query(`
      WITH RankedRepos AS (
        SELECT
          full_name,
          html_url,
          ROW_NUMBER() OVER(
            PARTITION BY html_url
            ORDER BY
              -- Prefer items that have user interaction or AI summaries
              (CASE WHEN is_favorite = true THEN 1 ELSE 0 END) DESC,
              (CASE WHEN is_archived = true THEN 1 ELSE 0 END) DESC,
              (CASE WHEN is_read = true THEN 1 ELSE 0 END) DESC,
              (CASE WHEN ai_summary IS NOT NULL AND ai_summary != '' THEN 1 ELSE 0 END) DESC,
              -- Fallback to oldest first
              first_seen_at ASC NULLS LAST,
              updated_at ASC NULLS LAST,
              full_name ASC
          ) as rn
        FROM repositories
        WHERE html_url IS NOT NULL
      )
      DELETE FROM repositories
      WHERE full_name IN (
        SELECT full_name FROM RankedRepos WHERE rn > 1
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
