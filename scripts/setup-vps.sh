#!/usr/bin/env bash
set -e

# setup-vps.sh
# Dockerized environment deployment
# Run via SSH: ssh user@host 'bash -s' < scripts/setup-vps.sh

echo "[INFO] Starting Docker-based setup..."

REPO_URL="https://github.com/thangvq95/thangvq-digital-hub.git"
BASE_DIR="$HOME/Development/thangvq-digital-hub"

# Check if Docker is available
if ! command -v docker >/dev/null 2>&1; then
    echo "[ERROR] Docker is not installed. Please run 'curl -fsSL https://get.docker.com | bash' first."
    exit 1
fi

if ! command -v git >/dev/null 2>&1; then
    echo "[ERROR] git is not installed. Required to clone the repository."
    exit 1
fi

# Clone or update repository
if [ ! -d "$BASE_DIR" ]; then
    echo "[INFO] Cloning repository to $BASE_DIR"
    mkdir -p "$(dirname "$BASE_DIR")"
    git clone "$REPO_URL" "$BASE_DIR"
else
    echo "[INFO] Updating existing repository"
    git -C "$BASE_DIR" fetch origin
    git -C "$BASE_DIR" reset --hard origin/main
fi

# Prepare environment configuration
if [ ! -f "$BASE_DIR/infra/.env" ]; then
    echo "========================================"
    echo "🔑 Environment Configuration"
    echo "========================================"
    echo "No .env file found. Let's configure it now."
    
    # Ask for WEBHOOK_SECRET
    read -p "Enter WEBHOOK_SECRET (Press Enter to use 'your_secret_here'): " input_secret
    input_secret=${input_secret:-your_secret_here}
    
    # Ask for PORT
    read -p "Enter PORT (Press Enter to use '8080'): " input_port
    input_port=${input_port:-8080}
    
    cat <<EOF > "$BASE_DIR/infra/.env"
WEBHOOK_SECRET=$input_secret
PORT=$input_port
# BASE_REPO=/app/repo
# WORKTREES_DIR=/app/worktrees
EOF
    echo "[INFO] .env file generated successfully at $BASE_DIR/infra/.env"
    echo "========================================"
fi

# Run Docker Compose
echo "[INFO] Booting up the system via Docker Compose..."
cd "$BASE_DIR/infra"
docker compose build
docker compose up -d

echo "[INFO] Setup successful! The AI Developer Workspace is running in the background."
echo "[INFO] Don't forget to update $BASE_DIR/infra/.env with your actual WEBHOOK_SECRET."
