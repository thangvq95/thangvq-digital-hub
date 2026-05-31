import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLearnings1717200001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create learning_topics table
    await queryRunner.query(`
      CREATE TABLE "learning_topics" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR UNIQUE NOT NULL,
        "display_name" VARCHAR NOT NULL,
        "color" VARCHAR DEFAULT '#6366f1'
      );
    `);

    // Seed initial topics
    await queryRunner.query(`
      INSERT INTO "learning_topics" ("name", "display_name", "color") VALUES
        ('flutter', 'Flutter', '#027DFD'),
        ('android', 'Android', '#3DDC84');
    `);

    // 2. Create learning_subtopics table
    await queryRunner.query(`
      CREATE TABLE "learning_subtopics" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR UNIQUE NOT NULL,
        "display_name" VARCHAR NOT NULL
      );
    `);

    // Seed initial subtopics
    await queryRunner.query(`
      INSERT INTO "learning_subtopics" ("name", "display_name") VALUES
        ('navigation', 'Navigation'),
        ('state-management', 'State Management'),
        ('deeplink', 'Deep Link'),
        ('ui-widgets', 'UI & Widgets'),
        ('architecture', 'Architecture'),
        ('performance', 'Performance'),
        ('testing', 'Testing'),
        ('animations', 'Animations'),
        ('networking', 'Networking'),
        ('storage', 'Storage & Database'),
        ('dependency-injection', 'Dependency Injection'),
        ('ci-cd', 'CI/CD'),
        ('dart-language', 'Dart Language'),
        ('kotlin', 'Kotlin'),
        ('jetpack-compose', 'Jetpack Compose'),
        ('gradle', 'Gradle & Build'),
        ('security', 'Security'),
        ('accessibility', 'Accessibility'),
        ('platform-channels', 'Platform Channels'),
        ('other', 'Other');
    `);

    // 3. Create learnings table
    await queryRunner.query(`
      CREATE TABLE "learnings" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "summary" TEXT,
        "source_url" TEXT,
        "source_type" VARCHAR DEFAULT 'manual',
        "image_path" TEXT,
        "topic_id" INTEGER NOT NULL REFERENCES "learning_topics"("id") ON DELETE RESTRICT,
        "subtopic_id" INTEGER REFERENCES "learning_subtopics"("id") ON DELETE SET NULL,
        "is_learned" BOOLEAN DEFAULT FALSE,
        "is_favorite" BOOLEAN DEFAULT FALSE,
        "content_hash" VARCHAR UNIQUE,
        "analyze_status" VARCHAR DEFAULT 'idle',
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Create indexes
    await queryRunner.query(
      `CREATE INDEX idx_learnings_topic ON learnings(topic_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_learnings_subtopic ON learnings(subtopic_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_learnings_learned ON learnings(is_learned);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_learnings_favorite ON learnings(is_favorite) WHERE is_favorite = TRUE;`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_learnings_created ON learnings(created_at DESC);`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_learnings_hash ON learnings(content_hash);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "learnings";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_subtopics";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_topics";`);
  }
}
