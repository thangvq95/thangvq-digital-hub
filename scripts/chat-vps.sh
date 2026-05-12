#!/bin/bash

# Script to quickly jump into Hermes Chat on the VPS
# Usage: ./scripts/chat-vps.sh

echo "🚀 Connecting to Hermes Gateway on VPS..."

ssh -t root@104.248.146.103 "docker compose -f /opt/thangvq-digital-hub/infra/docker-compose.yml exec hermes-gateway hermes chat"
