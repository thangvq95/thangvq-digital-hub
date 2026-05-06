FROM python:3.11-slim

# Install necessary system dependencies (Git, Curl, Node.js, NPM, GitHub CLI)
RUN apt-get update && apt-get install -y curl git gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y nodejs gh pipx \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Spec Kit (Specify CLI) for the VPS environment (for future automation)
RUN pipx install git+https://github.com/github/spec-kit.git
ENV PATH="/root/.local/bin:$PATH"

# Bypass Git's "dubious ownership" error when mounting volumes from the Host
RUN git config --global --add safe.directory '*'

# Install official Hermes CLI from NousResearch
RUN curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# Ensure Hermes is in the PATH environment variable
ENV PATH="/root/.local/bin:/root/.cargo/bin:$PATH"

WORKDIR /app
COPY infra/ai-developer-workspace/listener.py /app/listener.py

ENV BASE_REPO=/app/repo
ENV WORKTREES_DIR=/app/worktrees
ENV DEDUP_DB=/app/data/ai-workspace.db
ENV PORT=8080

EXPOSE 8080

CMD ["python", "/app/listener.py"]
