#!/usr/bin/env bash
set -e

# setup-vps.sh
# Dockerized environment deployment
# Run via SSH: ssh user@host 'bash -s' < scripts/setup-vps.sh

echo "[INFO] Starting Docker-based setup..."

REPO_URL="https://github.com/thangvq95/thangvq-digital-hub.git"
# Thông thường trên VPS Linux, thư mục /opt/ hoặc /var/www/ là chuẩn nhất cho các ứng dụng web.
BASE_DIR="/opt/thangvq-digital-hub"

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
    sudo mkdir -p "$(dirname "$BASE_DIR")"
    sudo chown -R $USER:$USER "$(dirname "$BASE_DIR")" # Đảm bảo quyền truy cập cho user hiện tại
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
    
    # Auto-generate secure secrets if user skips
    read -p "Enter WEBHOOK_SECRET (Press Enter to auto-generate): " input_webhook
    input_webhook=${input_webhook:-$(openssl rand -hex 32)}
    
    read -p "Enter SYNC_API_KEY (Press Enter to auto-generate): " input_sync
    input_sync=${input_sync:-$(openssl rand -hex 32)}

    read -p "Enter POSTGRES_PASSWORD (Press Enter to auto-generate): " input_pg
    input_pg=${input_pg:-$(openssl rand -hex 16)}

    cat <<EOF > "$BASE_DIR/infra/.env"
# 🔒 Security & Database
WEBHOOK_SECRET=$input_webhook
SYNC_API_KEY=$input_sync
POSTGRES_PASSWORD=$input_pg

# 🌐 API Backend
PORT=3005
NODE_ENV=production

# ☁️ Cloudflare (Optional)
CLOUDFLARE_TUNNEL_TOKEN=
EOF
    echo "[INFO] .env file generated successfully at $BASE_DIR/infra/.env"
    echo "========================================"
fi

# Run Docker Compose
echo "[INFO] Booting up the system via Docker Compose..."
cd "$BASE_DIR/infra"

# Dùng lệnh gộp này sẽ tối ưu hơn, nó tự build image mới nếu thấy Dockerfile thay đổi và chạy container.
docker compose up --build -d

echo "[INFO] Setup successful! 🚀 System is running in the background."
echo "[INFO] Run 'docker compose logs -f' inside $BASE_DIR/infra to see logs."
