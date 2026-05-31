# Learning Hub — Design Spec

> **Date:** 2026-05-31
> **Status:** Approved
> **Route:** `/learning`
> **Pattern:** Mirrors `/tech` (TechTrend) architecture but fully independent module

---

## Context & Motivation

As a senior developer, staying current with rapidly evolving technologies (Flutter, Android, Dart) is critical. Valuable learning content appears daily across LinkedIn, Medium, and official blogs — but there's no centralized place to capture, organize, and revisit this knowledge.

The Learning Hub solves this by:
1. **Hermes cronjob** scrapes Flutter & Android content from LinkedIn, Medium, and official blogs daily
2. **Manual add** lets the user submit any URL, image, or text — AI analyzes and structures it
3. **AI classification** automatically categorizes learnings by subtopic (navigation, state management, deeplink, etc.)
4. **Progress tracking** — mark items as "learned" to track what's been reviewed
5. **Telegram notifications** — daily summary of new learnings with direct link
6. **Deduplication** — prevents duplicate content via content hashing

**Initial topics:** Flutter and Android (native). More topics will be added later.

**Content example:** The attached LinkedIn infographic "ListView.builder vs ScrollView in Flutter" — a visual comparison card that would be stored as a compressed image with AI-extracted Markdown summary.

---

## 1. Database Schema

### `learning_topics` table

```sql
CREATE TABLE "learning_topics" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR UNIQUE NOT NULL,         -- e.g. 'flutter', 'android'
  "display_name" VARCHAR NOT NULL,        -- e.g. 'Flutter', 'Android'
  "color" VARCHAR DEFAULT '#6366f1'       -- Badge color for UI
);

INSERT INTO "learning_topics" ("name", "display_name", "color") VALUES
  ('flutter', 'Flutter', '#027DFD'),
  ('android', 'Android', '#3DDC84');
```

### `learning_subtopics` table

```sql
CREATE TABLE "learning_subtopics" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR UNIQUE NOT NULL,         -- e.g. 'navigation', 'state-management'
  "display_name" VARCHAR NOT NULL         -- e.g. 'Navigation', 'State Management'
);

-- Seed initial subtopics
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
```

### `learnings` table

```sql
CREATE TABLE "learnings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "summary" TEXT,                          -- AI-generated Markdown summary
  "source_url" TEXT,                       -- Original URL (LinkedIn, Medium, blog)
  "source_type" VARCHAR DEFAULT 'manual',  -- 'linkedin', 'medium', 'official_blog', 'manual', 'image'
  "image_path" TEXT,                       -- Relative path to compressed image on disk
  "topic_id" INTEGER NOT NULL REFERENCES "learning_topics"("id") ON DELETE RESTRICT,
  "subtopic_id" INTEGER REFERENCES "learning_subtopics"("id") ON DELETE SET NULL,
  "is_learned" BOOLEAN DEFAULT FALSE,      -- "Done" / already studied
  "is_favorite" BOOLEAN DEFAULT FALSE,
  "content_hash" VARCHAR UNIQUE,           -- SHA256 for deduplication
  "analyze_status" VARCHAR DEFAULT 'idle', -- 'idle', 'analyzing', 'done', 'failed'
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learnings_topic ON learnings(topic_id);
CREATE INDEX idx_learnings_subtopic ON learnings(subtopic_id);
CREATE INDEX idx_learnings_learned ON learnings(is_learned);
CREATE INDEX idx_learnings_favorite ON learnings(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_learnings_created ON learnings(created_at DESC);
CREATE INDEX idx_learnings_hash ON learnings(content_hash);
```

---

## 2. Backend — `backend/src/learnings/` module

Fully independent NestJS module. Does NOT share service/entity with the `repos` module.

### Entities

- **`LearningTopicEntity`** (`learning-topic.entity.ts`): `id`, `name`, `display_name`, `color`
- **`LearningSubtopicEntity`** (`learning-subtopic.entity.ts`): `id`, `name`, `display_name`
- **`LearningEntity`** (`learning.entity.ts`): Full schema above with ManyToOne relations to topic and subtopic

### Controller — `LearningsController`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/learnings` | GET | — | List learnings with filters: `tab` (to_learn/learned/favorites), `topic` (flutter/android), `subtopic`, `page`, `limit` |
| `/api/learnings/:id` | GET | — | Single learning detail |
| `/api/learnings/:id` | PATCH | — | Update: toggle `is_learned`, `is_favorite`, change `subtopic_id` |
| `/api/learnings/add` | POST | — | Manual add: multipart form with `url` OR `image` OR `text`, optional `topic` |
| `/api/learnings/upsert` | POST | `x-api-key` | Batch upsert from Hermes cronjob |
| `/api/learnings/topics` | GET | — | List all topics |
| `/api/learnings/subtopics` | GET | — | List all subtopics |

### Service — `LearningsService`

#### Manual Add Flow (`POST /api/learnings/add`)

```
1. User submits: { url?, image? (file upload), text?, topic? }
2. Compute content_hash:
   - If url → SHA256(source_url)
   - If image → SHA256(image buffer bytes)
   - If text → SHA256(text content)
3. Check content_hash exists → if yes, return existing learning (dedup)
4. If image uploaded:
   a. Compress image to ≤150KB using sharp (resize + quality reduction)
   b. Save compressed image to /app/uploads/learnings/<uuid>.webp
   c. Set image_path = "learnings/<uuid>.webp"
5. Fire-and-forget: AI analysis pipeline
   a. If url → fetch page content (title, body text)
   b. If image → call vision LLM to extract content from infographic
   c. AI generates: title (if not provided), summary (Markdown), topic classification, subtopic classification
   d. If subtopic doesn't exist in DB → create it automatically
   e. Update learning record with AI results, set analyze_status = 'done'
6. Return created learning immediately (analyze_status = 'analyzing')
```

#### Batch Upsert Flow (`POST /api/learnings/upsert`)

```
1. Validate x-api-key
2. For each learning in payload:
   a. Compute content_hash from source_url
   b. If hash exists → skip (dedup)
   c. If new → insert with analyze_status = 'idle'
3. Run background AI classification for all new learnings:
   a. Determine topic (flutter/android) from source content
   b. Classify subtopic via rule-based matching first, then LLM fallback
   c. Generate Markdown summary
4. Return { received, new, skipped }
```

#### AI Classification Logic

**Rule-based subtopic matching (checked first):**

| Subtopic | Keywords in title/content |
|---|---|
| `navigation` | navigator, go_router, auto_route, routing, push, pop, deeplink |
| `state-management` | bloc, riverpod, provider, cubit, getx, setState, state management |
| `deeplink` | deep link, universal link, app link, uri scheme |
| `ui-widgets` | widget, listview, scrollview, container, layout, scaffold, appbar |
| `architecture` | clean architecture, mvvm, mvc, repository pattern, dependency injection |
| `performance` | performance, optimization, jank, frame rate, memory leak, profiling |
| `testing` | test, widget test, integration test, unit test, mockito, bloc_test |
| `animations` | animation, lottie, rive, tween, implicit animation, hero |
| `networking` | http, dio, retrofit, api, rest, graphql, websocket |
| `dart-language` | dart 3, sealed class, pattern matching, records, extension type |
| `jetpack-compose` | compose, composable, modifier, lazycolumn, material3 |
| `kotlin` | kotlin, coroutines, flow, sealed class, data class |
| `gradle` | gradle, build.gradle, agp, version catalog |

**LLM fallback:** If no rule matches, call 9Router to classify:
```
Classify this learning content into a subtopic.
Title: "..."
Content snippet: "..."
Existing subtopics: [navigation, state-management, ...]
Return JSON: { "subtopicName": "..." }
If none fit, suggest a new lowercase-hyphenated subtopic name.
```

#### Image Compression Pipeline

All uploaded images are processed through `sharp` before storage:

```typescript
import sharp from 'sharp';

async compressImage(buffer: Buffer): Promise<Buffer> {
  let quality = 80;
  let result = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  // Iteratively reduce quality until under 150KB
  while (result.length > 150 * 1024 && quality > 20) {
    quality -= 10;
    result = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  // If still over 150KB, resize width down
  if (result.length > 150 * 1024) {
    result = await sharp(buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 30 })
      .toBuffer();
  }

  return result;
}
```

Output format: WebP (best compression ratio for infographics).
Storage path: `/app/uploads/learnings/<uuid>.webp`
Served via NestJS `ServeStaticModule` at `/uploads/learnings/*`

---

## 3. Frontend Routes & Components

### Routes

```
/learning                → Learning Hub landing (card grid with tabs)
/learning/[id]           → Learning detail page (image + summary side by side)
```

### Components — `components/learning/`

| Component | Description |
|---|---|
| `LearningHeader.tsx` | Tabs ("To Learn" / "Learned" / "Favorites") + topic filter pills (All / Flutter / Android) + subtopic chips + "Add Learning" button |
| `LearningCard.tsx` | Card: compressed image thumbnail, title, topic badge (Flutter blue / Android green), subtopic tag, source icon (LinkedIn/Medium/blog), "NEW" indicator for unanalyzed items |
| `LearningGrid.tsx` | Responsive grid + load-more pagination (20 items per batch) |
| `AddLearningDialog.tsx` | Modal dialog for manual add: URL input field, image upload dropzone, topic selector, submit → AI processes in background |
| `LearningDetail.tsx` | Detail view: original image (full size from source_url), AI Markdown summary, favorite button, "Mark as Learned" button, subtopic editor dropdown |

### Tab Behavior

| Tab | Filter | Default Sort |
|---|---|---|
| **To Learn** (default) | `is_learned = false` | `created_at DESC` (newest first) |
| **Learned** | `is_learned = true` | `updated_at DESC` (recently learned first) |
| **Favorites** | `is_favorite = true` | `created_at DESC` |

### Card Design

```
┌──────────────────────────────┐
│  [Compressed Image Preview]  │
│                              │
├──────────────────────────────┤
│  🔵 Flutter  · UI & Widgets │  ← topic badge + subtopic tag
│  ListView.builder vs Scro... │  ← title (truncated)
│  via LinkedIn · 2 hours ago  │  ← source icon + time
│              ⭐ Mark Learned │  ← action buttons
└──────────────────────────────┘
```

---

## 4. Hermes Cronjob — Daily Learning Scraper

**Schedule:** `0 2 * * *` (daily 9AM UTC+7 / 2AM UTC)
**Status:** Cronjob already created by user on Hermes.

### Hermes Prompt Template

```
You are a Learning Content Scraper for a senior Flutter & Android developer.

## Task
Scrape the following sources for Flutter and Android development content published in the last 24 hours:

### Sources to scrape:
1. **Medium Flutter tag**: https://medium.com/tag/flutter/latest — Get the 10 most recent articles
2. **Medium Android tag**: https://medium.com/tag/android/latest — Get the 10 most recent articles
3. **Official Flutter blog**: https://medium.com/flutter — Get any new posts
4. **Official Dart blog**: https://dart.dev/blog — Check for new posts
5. **LinkedIn**: Search for recent public posts with hashtags #flutter #flutterdev #android #androiddev — Get up to 10 posts with educational/technical content (skip job posts, promotions, personal updates)

### For each article/post found, extract:
- `title`: The article/post title or first meaningful sentence
- `source_url`: The canonical/permanent URL
- `source_type`: One of "medium", "official_blog", "linkedin"
- `topic`: "flutter" or "android" (based on content)
- `description`: First 300 characters of the content body

### Quality filters — SKIP items that are:
- Job postings or hiring announcements
- Self-promotional content without technical substance
- Duplicate content (same article shared by multiple people)
- Content older than 48 hours

### Submit results:
POST to https://api.thangvq95.page/api/learnings/upsert
Header: x-api-key: <SYNC_API_KEY>
Body: { "learnings": [{ "title": "...", "source_url": "...", "source_type": "...", "topic": "...", "description": "..." }] }

### After scraping, send a Telegram notification:
Use the Telegram Bot API:
POST https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/sendMessage
Body: {
  "chat_id": "<TELEGRAM_CHAT_ID>",
  "parse_mode": "Markdown",
  "text": "📚 *Learning Hub Daily Update*\n\n🐦 Flutter: X new learnings\n🤖 Android: Y new learnings\n⏭ Z skipped (duplicates)\n\n👉 [Review now](https://thangvq95.page/learning)"
}
```

---

## 5. Deduplication Strategy

| Input Type | Hash Method | Field |
|---|---|---|
| URL-based content | `SHA256(source_url)` | `content_hash` |
| Uploaded image (no URL) | `SHA256(raw image buffer)` | `content_hash` |
| Text-only (no URL, no image) | `SHA256(text content)` | `content_hash` |

The `content_hash` column has a UNIQUE constraint. On insert conflict → skip silently.

For the Hermes batch upsert, dedup happens server-side:
1. Compute hash for each incoming item
2. Query existing hashes in batch
3. Filter out duplicates before insert

---

## 6. Telegram Notification Integration

Reuses existing `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` already configured in `infra/docker-compose.yml` and GitHub Actions secrets. The Hermes cronjob prompt includes the Telegram notification step directly — no backend changes needed for notifications.

---

## 7. Verification Plan

### Backend Tests
- TypeORM migration runs cleanly
- CRUD endpoints return correct data
- Deduplication prevents duplicate inserts
- Image compression produces files ≤150KB
- AI classification assigns correct subtopics

### Frontend Verification
- `/learning` renders card grid with tabs
- Topic/subtopic filter pills work correctly
- "Add Learning" dialog submits and shows analyzing state
- Detail page shows image + Markdown summary side by side
- "Mark as Learned" and "Favorite" toggles work
- Load more pagination works

### E2E
- Hermes upsert endpoint accepts batch payload and creates learnings
- Dedup: submitting same URL twice only creates one record
