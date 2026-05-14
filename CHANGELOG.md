# Changelog

## [1.0.3](https://github.com/thangvq95/thangvq-digital-hub/compare/v1.0.2...v1.0.3) (2026-05-14)


### Bug Fixes

* **ci:** add --repo flag to gh pr merge for no-checkout context ([c6e1433](https://github.com/thangvq95/thangvq-digital-hub/commit/c6e14337738ba3a0fb96bc83b3d5ba8c071b3540))
* **ci:** extract PR number from JSON output for auto-merge ([b21cc7f](https://github.com/thangvq95/thangvq-digital-hub/commit/b21cc7f5bfd9b1835c599434aa79047e2dd465cd))
* Use step output for Playwright version ([09795cb](https://github.com/thangvq95/thangvq-digital-hub/commit/09795cbc66d42640c68d44055db5621349735c64))

## [1.0.2](https://github.com/thangvq95/thangvq-digital-hub/compare/v1.0.1...v1.0.2) (2026-05-14)


### Bug Fixes

* improve repo sorting and fix stars_growth display ([efb1478](https://github.com/thangvq95/thangvq-digital-hub/commit/efb14785722f51d4b43719f737098e63cc004393))
* use Partial&lt;RepositoryEntity&gt; for upsert updateData type ([474df88](https://github.com/thangvq95/thangvq-digital-hub/commit/474df8825a2e2670c2b4a650b3b10c57e9b1ee3c))

## [1.0.1](https://github.com/thangvq95/thangvq-digital-hub/compare/v1.0.0...v1.0.1) (2026-05-14)

### Bug Fixes

- resolve typescript unknown types in webhooks service ([22a4804](https://github.com/thangvq95/thangvq-digital-hub/commit/22a4804957813523f73b514ee23bf374abd7c28a))

## 1.0.0 (2026-05-14)

### Features

- **backend:** complete NestJS API — repos, releases, sync modules + Docker Compose + PostgreSQL ([a839469](https://github.com/thangvq95/thangvq-digital-hub/commit/a8394691f9c2de20ab7126ff26b22ee3c195d3be))
- **dashboard:** add API client + extended types + dashboard E2E tests ([1570d9d](https://github.com/thangvq95/thangvq-digital-hub/commit/1570d9d22a62c890018b3ba59d81a2284b4e6198))
- **dashboard:** add release feed page + ReleaseCard component ([bf51cd9](https://github.com/thangvq95/thangvq-digital-hub/commit/bf51cd93a238c6adac0d1a085e327e57db26b736))
- **dashboard:** add repo detail page at /tech/[repo] ([5213d28](https://github.com/thangvq95/thangvq-digital-hub/commit/5213d28eff5eb52297f8467475d4c2d09c8d4d2f))
- **dashboard:** complete Phase 1 TechTrend dashboard — filters, grid, detail, releases ([8b10fcd](https://github.com/thangvq95/thangvq-digital-hub/commit/8b10fcd35a1196a375f87325b58f6764d8f3083d))
- **dashboard:** implement FilterBar with period/domain/fav URL-param filters ([fea5ece](https://github.com/thangvq95/thangvq-digital-hub/commit/fea5ece95e3e357cfc630cd97d76645b9ed598cf))
- **dashboard:** wire RepoGrid, StatsBar, RepoCard to NestJS API ([a498e35](https://github.com/thangvq95/thangvq-digital-hub/commit/a498e35a6620a4bfdcf5ecb1e146ed4c7a37da7a))
- **infra:** add cloudflared tunnel service to docker-compose ([ab2839d](https://github.com/thangvq95/thangvq-digital-hub/commit/ab2839d0e527a74d2b0c8e3bcf6c04f13d289cb3))
- **portfolio:** implement ContactFooter with social links + expand E2E to 6 tests ([cbb3446](https://github.com/thangvq95/thangvq-digital-hub/commit/cbb34464c5fedc5c160e0da715c4434df4e91b7d))
- **portfolio:** implement ExperienceSection with alternating timeline ([0527577](https://github.com/thangvq95/thangvq-digital-hub/commit/0527577499f7f7d0b1514d55bc4ebd98a85b75c8))
- **portfolio:** implement HeroSection + TechStackSection with liquid glass effects ([9c08c3a](https://github.com/thangvq95/thangvq-digital-hub/commit/9c08c3a106b0c99b971fa994e68111f15231aa0c))
- **portfolio:** implement ProjectsSection with project cards ([eb9373a](https://github.com/thangvq95/thangvq-digital-hub/commit/eb9373a8404a445735e6735df51e24e37a0c5583))
- setup automated CI/CD pipeline and release process ([fa666fb](https://github.com/thangvq95/thangvq-digital-hub/commit/fa666fbd3ab1fb2ac22ff8d6f97d80b24e712a8b))

### Bug Fixes

- correct health check API URL in deploy workflow ([8b3cccb](https://github.com/thangvq95/thangvq-digital-hub/commit/8b3cccb7e2ddfbd28eabd7f5aa65dc969bf3d92a))
- disable sentry global filter to fix nestjs 11 500 error ([1987cf7](https://github.com/thangvq95/thangvq-digital-hub/commit/1987cf75a783cc39dd9ddf86a2853c03e10c37d2))
- **infra:** resolve PORT conflict between NestJS(3001) and Hermes(8080), fix DATABASE_URL ([a6a4f16](https://github.com/thangvq95/thangvq-digital-hub/commit/a6a4f167c13af8162434c27510aae5b026711548))
- remove duplicate silent property in next config ([20031d5](https://github.com/thangvq95/thangvq-digital-hub/commit/20031d5a6fcda222fb80084fc6d4a569c3a6fe18))
- update dashboard test locators to match UI ([121469c](https://github.com/thangvq95/thangvq-digital-hub/commit/121469ce0539ef4c38f97c2fc229351c43a897bd))
