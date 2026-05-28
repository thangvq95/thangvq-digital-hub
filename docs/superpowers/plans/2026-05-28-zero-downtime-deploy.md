# Zero Downtime Deploy & Telegram Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce deployment downtime to a minimum (2-5s) and integrate Telegram notifications for deploy start, success, and failure.

**Architecture:** We will modify `.github/workflows/deploy.yml` to build Docker images on the VPS before replacing the containers (preventing downtime during building) and use `curl` to call the Telegram Bot API during start, success, and failure.

**Tech Stack:** GitHub Actions, Docker Compose, Telegram Bot API.

---

### Task 1: Update deploy.yml Workflow

**Files:**

- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Update the GitHub Actions workflow file `.github/workflows/deploy.yml`**
      Modify `.github/workflows/deploy.yml` to:
  1. Add a step to send Telegram notification at the start of backend deployment.
  2. Optimize the VPS Docker Compose steps to build images first, then recreate containers.
  3. Add a step to send Telegram notification if backend deployment fails.
  4. Add a step to send Telegram notification if frontend deployment fails.
  5. Add a step to send Telegram notification if the entire deployment completes successfully.

  Replace the content of `.github/workflows/deploy.yml` with the following:

  ```yaml
  name: "Deploy: Production (VPS + Vercel)"

  on:
    release:
      types: [published]

  jobs:
    deploy-backend:
      name: Deploy Backend to VPS
      runs-on: ubuntu-latest
      steps:
        - name: Notify Telegram on Start
          run: |
            curl -s -X POST https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage \
              -H "Content-Type: application/json" \
              -d "{\"chat_id\": \"${{ secrets.TELEGRAM_CHAT_ID }}\", \"text\": \"🚀 *[thangvq-digital-hub]* Bắt đầu deploy tag \`${{ github.event.release.tag_name }}\` lên VPS và Vercel...\", \"parse_mode\": \"Markdown\"}"

        - name: Deploy via SSH
          uses: appleboy/ssh-action@v1.0.3
          with:
            host: ${{ secrets.VPS_HOST }}
            username: ${{ secrets.VPS_USERNAME }}
            key: ${{ secrets.VPS_SSH_KEY }}
            command_timeout: 30m
            # Default to project directory on VPS, pull code and build
            script: |
              cd ${{ secrets.VPS_PROJECT_PATH }}
              if [ -f .git/index.lock ]; then
                if lsof .git/index.lock > /dev/null 2>&1 || fuser .git/index.lock > /dev/null 2>&1; then
                  echo "Error: Active process holds .git/index.lock. Aborting deploy."
                  exit 1
                fi
                if find .git/index.lock -mmin +5 | grep -q .; then
                  echo "Removing stale index.lock (older than 5 minutes)."
                  rm -f .git/index.lock
                else
                  echo "Error: index.lock exists and is not stale (< 5 mins). Aborting deploy to prevent corruption."
                  exit 1
                fi
              fi
              git fetch --tags origin
              git checkout ${{ github.event.release.tag_name }}
              cd infra

              # Automatically create .env file from GitHub Secrets
              rm -f .env
              echo "SYNC_API_KEY=${{ secrets.SYNC_API_KEY }}" >> .env
              echo "POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}" >> .env
              echo "PORT=${{ secrets.PORT }}" >> .env
              echo "NODE_ENV=${{ secrets.NODE_ENV }}" >> .env
              echo "NINE_ROUTER_URL=${{ secrets.NINE_ROUTER_URL }}" >> .env
              echo "NINE_ROUTER_MODEL=${{ secrets.NINE_ROUTER_MODEL }}" >> .env
              echo "NINE_ROUTER_API_KEY=${{ secrets.NINE_ROUTER_API_KEY }}" >> .env
              echo "OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}" >> .env
              echo "CLOUDFLARE_TUNNEL_TOKEN=${{ secrets.CLOUDFLARE_TUNNEL_TOKEN }}" >> .env
              echo "SENTRY_DSN_BE=${{ secrets.SENTRY_DSN_BE }}" >> .env
              echo "SENTRY_PROJECT_BE=${{ secrets.SENTRY_PROJECT_BE }}" >> .env
              echo "GH_PAT=${{ secrets.GH_PAT }}" >> .env
              echo "COMPOSIO_API_KEY=${{ secrets.COMPOSIO_API_KEY }}" >> .env

              # Set secure permissions
              chmod 600 .env

              # 1. Build custom backend and agent services before recreating containers.
              # During build, the current containers remain online serving requests.
              docker compose build api hermes-gateway hermes-dashboard

              # 2. Recreate changed containers. Docker Compose handles stopping the old container
              # and launching the new container sequentially. Postgres and Cloudflared remain running.
              docker compose up -d --remove-orphans postgres api hermes-gateway hermes-dashboard cloudflared

              # 3. Clean up dangling images to avoid filling up VPS disk space
              docker image prune -f

        - name: Health Check API
          # Wait up to 60s, continuously pinging the API until it returns 200 OK
          run: |
            echo "Waiting for API to be healthy..."
            timeout 60 bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' https://api.thangvq95.page/api/repos)" != "200" ]]; do sleep 5; done' || false
            echo "API is healthy! Proceeding to deploy Frontend."

        - name: Notify Telegram on Failure (Backend)
          if: failure()
          run: |
            curl -s -X POST https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage \
              -H "Content-Type: application/json" \
              -d "{\"chat_id\": \"${{ secrets.TELEGRAM_CHAT_ID }}\", \"text\": \"❌ *[thangvq-digital-hub]* Deploy Backend THẤT BẠI cho tag \`${{ github.event.release.tag_name }}\`! Vui lòng kiểm tra Github Actions log.\", \"parse_mode\": \"Markdown\"}"

    deploy-frontend:
      name: Trigger Vercel Frontend
      needs: deploy-backend
      runs-on: ubuntu-latest
      steps:
        - name: Checkout Code
          uses: actions/checkout@v4

        - name: Deploy to Vercel (Bypass Ignore Build Step)
          uses: amondnet/vercel-action@v20
          with:
            vercel-token: ${{ secrets.VERCEL_TOKEN }}
            vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
            vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
            github-token: ${{ secrets.GITHUB_TOKEN }}
            vercel-args: "--prod"

        - name: Notify Telegram on Failure (Frontend)
          if: failure()
          run: |
            curl -s -X POST https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage \
              -H "Content-Type: application/json" \
              -d "{\"chat_id\": \"${{ secrets.TELEGRAM_CHAT_ID }}\", \"text\": \"❌ *[thangvq-digital-hub]* Deploy Frontend THẤT BẠI cho tag \`${{ github.event.release.tag_name }}\`! Vui lòng kiểm tra Github Actions log.\", \"parse_mode\": \"Markdown\"}"

        - name: Notify Telegram on Success
          if: success()
          run: |
            curl -s -X POST https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage \
              -H "Content-Type: application/json" \
              -d "{\"chat_id\": \"${{ secrets.TELEGRAM_CHAT_ID }}\", \"text\": \"✅ *[thangvq-digital-hub]* Deploy thành công tag \`${{ github.event.release.tag_name }}\`! Hệ thống đã online ổn định.\", \"parse_mode\": \"Markdown\"}"
  ```

- [ ] **Step 2: Dry-run and validate YAML file syntax**
      Check that the YAML parses correctly.
      Run: `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/deploy.yml', 'utf8'))"` (or simple syntax check)

- [ ] **Step 3: Commit and create PR**
      Commit the changes using a conventional commit message.
      Run:
  ```bash
  git add .github/workflows/deploy.yml docs/superpowers/specs/2026-05-28-zero-downtime-deploy-design.md docs/superpowers/plans/2026-05-28-zero-downtime-deploy.md
  git commit -m "feat: optimize deploy downtime and add telegram notifications"
  gh pr create --fill
  ```
