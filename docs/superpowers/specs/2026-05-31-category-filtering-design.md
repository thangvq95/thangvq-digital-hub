# Category Filtering and Auto-Classification Design

This document details the design for adding category filtering, category CRUD, repository auto-classification, and cleanup of placeholder repository metadata.

---

## 1. Problem & Context

The TechTrend dashboard currently lists trending and manually added repositories without any categorization. Users need a way to filter repositories by categories (e.g., 'video', 'memory', 'skills', 'finance') to quickly navigate and view repositories belonging to specific domains.
Additionally, when repository metadata (like language or latest release tag) is missing or defaults to `"Unknown"`, the UI displays placeholder text that clutters the interface.

---

## 2. Requirements & Goals

1. **Metadata Cleanup**: Hide the release badge and language display in both the repository card and details page if their value is `"Unknown"` (case-insensitive) or missing.
2. **Category CRUD API**: Add endpoints to fetch, create, update, and delete categories.
3. **Repository Category Relationship**: Associate each repository with a unique category (optional relation, many-to-one).
4. **Auto-Classification**:
   - Classify new repositories on upsert (weekly sync) or manual addition.
   - Use keyword/regex rules first (e.g., `gitnexus`, `remotion`, `tradingagents`).
   - Use LLM (9Router) to classify repositories when rules do not match, automatically creating new categories if suggested.
   - Create a migration endpoint to classify all existing repositories.
5. **Dashboard Filtering**: Provide a horizontal scrollable row of category filter pills on the dashboard.
6. **Manual Assignment**: Provide a dropdown selector in the detail page to allow manually changing or creating a category for a repository.

---

## 3. Database Schema changes

We will create a new `categories` table and link it to the `repositories` table.

```sql
CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR UNIQUE NOT NULL
);

-- Insert initial user-defined categories
INSERT INTO "categories" ("name") VALUES ('video'), ('memory'), ('skills'), ('finance');

-- Add category_id to repositories
ALTER TABLE "repositories" ADD COLUMN "category_id" INTEGER;

-- Foreign key referencing categories
ALTER TABLE "repositories"
ADD CONSTRAINT "FK_repositories_category_id"
FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL;
```

---

## 4. Backend Architecture & API Changes

### Entities

- **`CategoryEntity`** (`backend/src/repos/category.entity.ts`):
  - `id`: number (PK)
  - `name`: string (unique)
  - `repositories`: `RepositoryEntity[]` (One-to-Many)
- **`RepositoryEntity`** (`backend/src/repos/repository.entity.ts`):
  - Add `category`: `CategoryEntity | null` (Many-to-One with `@JoinColumn({ name: 'category_id' })`)

### Controllers & Endpoints

- **`CategoriesController`** (`backend/src/repos/categories.controller.ts`):
  - `GET /api/categories` -> List all categories ordered by name.
  - `POST /api/categories` -> Create a category.
  - `PUT /api/categories/:id` -> Update category name.
  - `DELETE /api/categories/:id` -> Delete a category.
- **`ReposController`** (`backend/src/repos/repos.controller.ts`):
  - Update `GET /api/repos` to accept `category` query parameter.
  - Update `PATCH /api/repos/:fullName` to accept `category_id` in request body.
  - Add `POST /api/repos/classify-all` to trigger background classification of all uncategorized repos.

### Services & Classification Logic

- **`ReposService`** (`backend/src/repos/repos.service.ts`):
  - `classifyRepo(repo: RepositoryEntity)`:
    - Runs rule-based matching:
      - `memory`: matches `understand-anything`, `gitnexus`, `agentmemory`, `codegraph`.
      - `skills`: matches `superpowers`, `skills`, `agent-skills`, `planning`.
      - `finance`: matches `tradingagents`, `financial-services`, `finance`, `trading`.
      - `video`: matches `video`, `remotion`.
    - If no rule matches, calls 9Router LLM with the repo name and description, requesting the best matching category from current list, or proposing a new, short, lowercase category.
    - Saves the assigned category to the repository.
  - `classifyAllRepos()`:
    - Iterates over all repositories where `category_id` is null and calls `classifyRepo`.
  - Update `upsert()` and `addManualRepo()` to call `classifyRepo()` for new repositories.

---

## 5. Frontend UI/UX Design

### Dashboard Filter Pills (`components/dashboard/DashboardHeader.tsx` or `app/tech/page.tsx`)

- Display category pills right above the repository cards grid.
- Fetch categories from `GET /api/categories`.
- Show "All" pill by default.
- Select category pill -> update URL query parameters and reload repository list.

### Detail Page Category Selector (`app/tech/[owner]/[repo]/page.tsx`)

- Show current category tag under the repo name/description.
- Clickable dropdown menu showing all existing categories.
- An option to "Create new category" which prompts the user for a name, makes a POST request to create it, and automatically updates the repository.

---

## 6. Verification & E2E Testing Plan

- **Backend Tests**: Run TypeORM migrations and check schema integrity.
- **Auto-classification Integration**: Verify rule-based classification and 9Router classification logic in mock environments.
- **API Tests**: Verify category CRUD and filtering via curl or playwright tests.
- **Frontend Verification**: Verify UI rendering, category pills filtering, and details page category dropdown selector.
