# Design Specification: Zero Downtime Deployment & Telegram Notifications

## 1. Objective

Currently, the backend deployment script in GitHub Actions (`deploy.yml`) stops all running containers, builds the new Docker images on the VPS, and then starts the containers. This causes minutes of downtime during deployment. Additionally, the user wants Telegram notifications sent automatically when deployment starts, when it succeeds, and when it fails.

Our objectives are:

1. **Reduce Downtime**: Optimize Docker Compose commands in the deploy script to build images first, then recreate containers. This reduces downtime to the NestJS startup time (~2-5 seconds).
2. **Telegram Notifications**: Integrate Telegram Bot API notifications for deployment starting, successful deployment (passing health check), and failed deployment.

## 2. Approach & Architecture

We will update the GitHub Actions workflow file `.github/workflows/deploy.yml`.

### Docker Compose Optimization

Currently, the deploy script runs:

```bash
docker compose down --remove-orphans
docker rm -f hermes-gateway hermes-dashboard digitalhub-api digitalhub-tunnel digitalhub-postgres || true
docker compose up --build -d postgres api hermes-gateway hermes-dashboard cloudflared
```

This will be updated to:

```bash
# Build custom backend and agent services before recreating containers.
# During build, the current containers remain online serving requests.
docker compose build api hermes-gateway hermes-dashboard

# Recreate changed containers. Docker Compose handles stopping the old container
# and launching the new container sequentially. Postgres and Cloudflared remain running.
docker compose up -d --remove-orphans postgres api hermes-gateway hermes-dashboard cloudflared

# Remove dangling docker images to prevent VPS disk space build-up.
docker image prune -f
```

### Telegram Integration

We will invoke the Telegram Bot API using `curl` from GitHub Actions steps using `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` secrets.

Three hook locations will be added:

1. **Start Notify**: A step at the start of the `deploy-backend` job.
2. **Success Notify**: A step at the end of the `deploy-frontend` job (which runs after backend completes successfully).
3. **Failure Notify**: Steps at the end of both `deploy-backend` and `deploy-frontend` with `if: failure()`.

Message format (Markdown):

- **Start**: `🚀 *[thangvq-digital-hub]* Bắt đầu deploy tag \`${{ github.event.release.tag_name }}\` lên VPS và Vercel...`
- **Success**: `✅ *[thangvq-digital-hub]* Deploy thành công tag \`${{ github.event.release.tag_name }}\`! Hệ thống đã online ổn định.`
- **Failure**: `❌ *[thangvq-digital-hub]* Deploy [Backend / Frontend] THẤT BẠI cho tag \`${{ github.event.release.tag_name }}\`! Vui lòng kiểm tra Github Actions log.`

## 3. Implementation Plan

1. Update `.github/workflows/deploy.yml` with the new Docker Compose commands and the Telegram notification curl steps.
2. Verify syntax of the YAML file.
3. Commit changes and create a PR.
