# 🔄 VPS Migration Guide

This document provides a step-by-step guide on how to migrate the entire "ThangVQ Digital Hub" system (including the Database, Webhook system, and Hermes AI state) from an old VPS to a new VPS (or to a Local Mac Mini) **without losing any data**.

---

## 📦 PHASE 1: BACKUP FROM OLD SERVER

### 1. Backup Database (PostgreSQL)
The safest way to migrate Postgres data is using `pg_dump`. The output file is OS-independent.

```bash
cd /opt/thangvq-digital-hub/infra
docker exec -t digitalhub-postgres pg_dump -U digitalhub digitalhub > digitalhub_backup.sql
```

### 2. Backup Hermes "Brain" (Kanban & History)
Hermes data resides in the `hermes_data` Docker Volume. We'll use a temporary Alpine container to compress this volume into a tarball:

```bash
docker run --rm -v hermes_data:/volume -v $(pwd):/backup alpine tar -czvf /backup/hermes_backup.tar.gz -C /volume .
```

### 3. Backup Webhook Data (Event Deduplication)
Our listener uses SQLite to prevent duplicate GitHub events. This data is in the `listener_data` volume:

```bash
docker run --rm -v listener_data:/volume -v $(pwd):/backup alpine tar -czvf /backup/listener_backup.tar.gz -C /volume .
```

*(Note: There is no need to backup `gitnexus_data` because it's purely source code metadata. On the new server, running `gitnexus analyze` will rebuild it cleanly in 1-2 minutes).*

### 4. Backup Environment Configuration (.env)
```bash
cp .env .env.backup
```

### 5. Download Backups
You now have 4 files: `digitalhub_backup.sql`, `hermes_backup.tar.gz`, `listener_backup.tar.gz`, and `.env.backup`. Use `scp` or `sftp` to download them to your local machine, ready to be transferred to the new server.

---

## 🚀 PHASE 2: RESTORE ON NEW SERVER

### 1. Initialize Environment
Log into your new VPS and set up the infrastructure (Install Docker, Clone source code):

```bash
git clone https://github.com/thangvq95/thangvq-digital-hub.git /opt/thangvq-digital-hub
cd /opt/thangvq-digital-hub/infra
```

**Upload the 4 backup files** (from the previous steps) to the new VPS and place them in the `/opt/thangvq-digital-hub/infra` directory.

Rename the backup `.env` file:
```bash
mv .env.backup .env
```

### 2. Create Empty Volumes
We need to create the empty Docker Volumes before injecting the data:

```bash
docker volume create hermes_data
docker volume create listener_data
```

### 3. Restore Hermes and Listener Data
Extract the `tar.gz` files directly into the respective Docker Volumes:

```bash
docker run --rm -v hermes_data:/volume -v $(pwd):/backup alpine sh -c "cd /volume && tar -xzvf /backup/hermes_backup.tar.gz"
docker run --rm -v listener_data:/volume -v $(pwd):/backup alpine sh -c "cd /volume && tar -xzvf /backup/listener_backup.tar.gz"
```

### 4. Boot Up the System
Start all containers in the background:

```bash
docker compose up --build -d
```
At this point, an empty Postgres database has been created. Wait 5-10 seconds for the database to stabilize.

### 5. Restore Database (Postgres)
Inject the SQL data into the running Postgres container:

```bash
cat digitalhub_backup.sql | docker exec -i digitalhub-postgres psql -U digitalhub -d digitalhub
```

---

## 🎉 COMPLETION
Visit `kanban.thangvq95.page` (or your respective UI) to verify. The entire Task history, Hermes DAG state machine, and Dashboard data will be **100% restored** exactly as you left it!
