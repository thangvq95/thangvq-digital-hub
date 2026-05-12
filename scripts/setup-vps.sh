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
    read -p "Enter WEBHOOK_SECRET (Press Enter to auto-generate): " input_webhook < /dev/tty || input_webhook=""
    input_webhook=${input_webhook:-$(openssl rand -hex 32)}
    
    read -p "Enter SYNC_API_KEY (Press Enter to auto-generate): " input_sync < /dev/tty || input_sync=""
    input_sync=${input_sync:-$(openssl rand -hex 32)}

    read -p "Enter POSTGRES_PASSWORD (Press Enter to auto-generate): " input_pg < /dev/tty || input_pg=""
    input_pg=${input_pg:-$(openssl rand -hex 16)}

    # Optional API Keys
    read -p "Enter NINE_ROUTER_API_KEY (Optional, press Enter to skip): " input_nine_router < /dev/tty || input_nine_router=""
    read -p "Enter OPENAI_API_KEY (Optional, press Enter to skip): " input_openai < /dev/tty || input_openai=""
    read -p "Enter CLOUDFLARE_TUNNEL_TOKEN (Optional, press Enter to skip): " input_cf < /dev/tty || input_cf=""

    cat <<EOF > "$BASE_DIR/infra/.env"
# 🔒 Security & Database
WEBHOOK_SECRET=$input_webhook
SYNC_API_KEY=$input_sync
POSTGRES_PASSWORD=$input_pg

# 🌐 API Backend
PORT=3001
NODE_ENV=production

# 🤖 AI Analysis (9Router & OpenAI)
NINE_ROUTER_URL=https://9router.phieucaphe.com/v1
NINE_ROUTER_MODEL=planning
NINE_ROUTER_API_KEY=$input_nine_router
OPENAI_API_KEY=$input_openai

# ☁️ Cloudflare (Optional)
CLOUDFLARE_TUNNEL_TOKEN=$input_cf
EOF
    echo "[INFO] .env file generated successfully at $BASE_DIR/infra/.env"
    echo "========================================"
fi

# Run Docker Compose
echo "[INFO] Booting up the system via Docker Compose..."
cd "$BASE_DIR/infra"

# Set up 4GB swap space to prevent OOM errors during Docker builds (Exit Code 137)
if [ ! -f /swapfile ]; then
    echo "[INFO] Creating 4GB swap file to prevent out-of-memory errors..."
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "[INFO] Swap space created and enabled."
else
    echo "[INFO] Swap space already exists."
fi

# Dùng lệnh gộp này sẽ tối ưu hơn, nó tự build image mới nếu thấy Dockerfile thay đổi và chạy container.
docker compose up --build -d

echo "[INFO] Setup successful! 🚀 System is running in the background."
echo "[INFO] Run 'docker compose logs -f' inside $BASE_DIR/infra to see logs."
