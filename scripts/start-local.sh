#!/usr/bin/env bash
# start-local.sh
# Local minimal Docker environment launcher (Postgres and NestJS API only)
# Bypasses Hermes Gateway, Hermes Dashboard, and Cloudflare Tunnel to save resources.

set -e

# Determine the directory of this script and navigate to infra folder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infra"
cd "$INFRA_DIR"

echo "========================================================="
echo "🚀 Launching Local API Environment (postgres + api)..."
echo "========================================================="

# 1. Validate .env file
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found in infra directory!"
    if [ -f ".env.example" ]; then
        echo "💡 Copying .env.example to .env..."
        cp .env.example .env
        echo "✅ Created .env file. Please review configuration if needed."
    else
        echo "❌ Error: Missing both .env and .env.example to initialize."
        exit 1
    fi
fi

# 2. Spin up only postgres and api
echo "[INFO] Building and starting postgres & api..."
docker compose up postgres api --build -d --remove-orphans

echo ""
echo "========================================================="
echo "🎉 Environment launched successfully!"
echo "========================================================="
echo "👉 NestJS API running at:       http://localhost:3005"
echo "👉 Postgres DB exposed at:     localhost:5435"
echo ""
echo "💡 To start the Frontend (Next.js):"
echo "   Run this command in a new terminal window at the repository root:"
echo "   npm run dev"
echo ""
echo "Useful Commands:"
echo "• Watch API real-time logs:    docker compose logs -f api"
echo "• Check container status:      docker compose ps"
echo "• Stop the environment:        docker compose down"
echo "========================================================="
