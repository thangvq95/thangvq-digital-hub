FROM python:3.11-slim

# Install necessary system dependencies (Git, Curl, Node.js, NPM, GitHub CLI)
RUN apt-get update && apt-get install -y curl git gnupg build-essential \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y nodejs gh pipx ripgrep ffmpeg unzip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install GitNexus as the global codebase knowledge graph MCP server
RUN npm install -g gitnexus

# Install Composio CLI globally
RUN curl -fsSL https://composio.dev/install | bash



# Bypass Git's "dubious ownership" error when mounting volumes from the Host
RUN git config --global --add safe.directory '*' \
    && git config --global http.postBuffer 524288000 \
    && git config --global http.version HTTP/1.1

# Install official Hermes CLI from NousResearch
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Install dashboard dependencies (fastapi, uvicorn, ptyprocess) inside the Hermes virtual environment using uv
RUN if [ -d /usr/local/lib/hermes-agent/venv ]; then \
      /root/.local/bin/uv pip install --python /usr/local/lib/hermes-agent/venv fastapi uvicorn ptyprocess; \
    elif [ -d /root/.hermes/venv ]; then \
      /root/.local/bin/uv pip install --python /root/.hermes/venv fastapi uvicorn ptyprocess; \
    else \
      echo "Error: Virtual environment not found!" && exit 1; \
    fi

# Copy the custom User-Agent monkeypatch into the virtual environment's site-packages to bypass Cloudflare WAF blocks on 9router
# This ensures it is loaded by all python processes inside the venv, even if PYTHONPATH is cleared or ignored.
COPY infra/patches/sitecustomize.py /usr/local/lib/hermes-agent/venv/lib/python3.11/site-packages/sitecustomize.py


# Ensure Hermes is in the PATH environment variable
ENV PATH="/root/.local/bin:/root/.cargo/bin:$PATH"

WORKDIR /app

ENV BASE_REPO=/app/repo
ENV WORKTREES_DIR=/app/worktrees
ENV DEDUP_DB=/app/data/ai-workspace.db

CMD ["hermes", "dashboard", "--host", "0.0.0.0", "--port", "9119", "--no-open", "--insecure"]
