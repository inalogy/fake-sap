# HRMS Application - Deployment Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Option A: Docker Deployment (Recommended)](#option-a-docker-deployment-recommended)
4. [Option B: Bare-Metal / VM Deployment](#option-b-bare-metal--vm-deployment)
5. [Option C: Ansible Automated Deployment](#option-c-ansible-automated-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
8. [Backup & Restore](#backup--restore)
9. [Troubleshooting](#troubleshooting)
10. [Security Checklist](#security-checklist)

---

## Architecture Overview

```
                    ┌──────────────┐
                    │   Nginx      │ :80 / :443
                    │ (reverse     │
                    │  proxy)      │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Node.js     │ :5000
                    │  Express     │
                    │  (serves     │
                    │  API + React │
                    │  static)     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ PostgreSQL   │ :5432
                    │  15+         │
                    └──────────────┘
```

**Stack:**
- **Backend:** Node.js 18+ / Express
- **Frontend:** React (built and served as static files by Express in production)
- **Database:** PostgreSQL 15+
- **Auth:** JWT tokens, bcrypt password hashing

---

## Prerequisites

| Component    | Minimum Version | Notes                          |
|-------------|----------------|-------------------------------|
| Node.js     | 18 LTS         | 20 LTS also supported         |
| PostgreSQL  | 15             | 16 also supported             |
| npm         | 9+             | Comes with Node.js            |
| Docker      | 24+            | Only for Docker deployment    |
| Docker Compose | 2.20+       | Only for Docker deployment    |
| Git         | 2.x            | To clone the repository       |

---

## Option A: Docker Deployment (Recommended)

This is the simplest deployment method. One command brings up the full stack.

### 1. Clone and configure

```bash
git clone <repo-url> /opt/hrms-app
cd /opt/hrms-app
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` with production values:

```ini
NODE_ENV=production
PORT=5000

DB_HOST=postgres       # Docker service name, NOT localhost
DB_PORT=5432
DB_NAME=sap
DB_USER=sap_user
DB_PASSWORD=<generate-strong-password>

JWT_SECRET=<generate-random-64-char-string>
```

Generate secure values:

```bash
# Generate DB password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64
```

### 3. Start the stack

```bash
docker compose up -d
```

This will:
- Build the React frontend
- Build the Node.js production image
- Start PostgreSQL with the schema auto-loaded from `sql/` directory
- Start the application on port 5000

### 4. Verify

```bash
docker compose ps          # Both services should be "Up"
docker compose logs app    # Should show "Server is running on port 5000"

curl http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 5. Manage

```bash
docker compose logs -f           # Follow logs
docker compose restart app       # Restart app only
docker compose down              # Stop everything
docker compose up -d --build     # Rebuild after code changes
```

---

## Option B: Bare-Metal / VM Deployment

Use this when Docker is not available or not desired.

### 1. Install system dependencies

**Ubuntu/Debian:**

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# PostgreSQL 15
sudo apt-get install -y postgresql-15 postgresql-client-15
```

**Rocky Linux / RHEL:**

```bash
# Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# PostgreSQL 15
sudo dnf install -y postgresql-server postgresql
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```

### 2. Set up PostgreSQL

```bash
sudo -u postgres psql <<'SQL'
CREATE USER sap_user WITH PASSWORD '<your-strong-password>';
CREATE DATABASE sap OWNER sap_user;
\c sap
GRANT ALL PRIVILEGES ON SCHEMA public TO sap_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sap_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sap_user;
SQL
```

Load the schema and seed data:

```bash
PGPASSWORD='<your-password>' psql -h localhost -U sap_user -d sap -f sql/02-sap-hcm-schema.sql
PGPASSWORD='<your-password>' psql -h localhost -U sap_user -d sap -f sql/03-sap-om-schema.sql
PGPASSWORD='<your-password>' psql -h localhost -U sap_user -d sap -f sql/04-sap-hcm-employees.sql
```

If you get an error about `update_updated_at_char_column()`, create it first:

```bash
PGPASSWORD='<your-password>' psql -h localhost -U sap_user -d sap <<'SQL'
CREATE OR REPLACE FUNCTION update_updated_at_char_column() RETURNS trigger
    LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at_char = to_char(now(),'YYYY-MM-DD HH24:MI:SS.MS');
  RETURN NEW;
END;
$$;
SQL
```

### 3. Deploy the application

```bash
# Create app user
sudo useradd -r -m -s /bin/bash hrms-app

# Clone repo
sudo -u hrms-app git clone <repo-url> /opt/hrms-app
cd /opt/hrms-app

# Install dependencies
sudo -u hrms-app npm ci --only=production

# Build the React frontend
cd client
sudo -u hrms-app npm ci
sudo -u hrms-app npm run build
cd ..
```

### 4. Configure environment

```bash
sudo -u hrms-app cp .env.example .env
sudo -u hrms-app nano .env
```

Set production values:

```ini
NODE_ENV=production
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sap
DB_USER=sap_user
DB_PASSWORD=<your-strong-password>
JWT_SECRET=<your-random-secret>
```

Lock down the file:

```bash
sudo chmod 600 /opt/hrms-app/.env
sudo chown hrms-app:hrms-app /opt/hrms-app/.env
```

### 5. Create systemd service

```bash
sudo tee /etc/systemd/system/hrms-app.service > /dev/null <<'EOF'
[Unit]
Description=HRMS Application
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=hrms-app
Group=hrms-app
WorkingDirectory=/opt/hrms-app
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/hrms-app/.env

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/hrms-app

[Install]
WantedBy=multi-user.target
EOF
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now hrms-app
sudo systemctl status hrms-app
```

### 6. Verify

```bash
journalctl -u hrms-app -f   # Check logs

curl http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Option C: Ansible Automated Deployment

For deploying to one or more Rocky Linux servers.

### 1. Configure inventory

Edit `ansible/inventory.ini`:

```ini
[rocky_servers]
server1.example.com ansible_user=deploy ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

### 2. Set credentials

```bash
export DB_PASSWORD=$(openssl rand -base64 32)
```

### 3. Deploy

```bash
cd ansible
bash deploy.sh
```

This runs the full playbook: installs packages, sets up PostgreSQL, deploys the app, configures Nginx, and enables the systemd service.

---

## Post-Deployment Verification

Run these checks after any deployment method:

```bash
# 1. Login
TOKEN=$(curl -s http://localhost:5000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 2. Test employees endpoint
curl -s http://localhost:5000/api/employees \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -5

# 3. Test organizations endpoint
curl -s http://localhost:5000/api/organizations \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -5

# 4. Test org tree endpoint
curl -s http://localhost:5000/api/organizations/tree \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | head -5

# 5. Open in browser
echo "Open http://<server-ip>:5000 in your browser"
```

**Default credentials:**

| Username    | Password   | Role       |
|------------|-----------|-----------|
| `admin`     | `admin123` | Admin      |
| `hr_manager`| `admin123` | HR Manager |

**Change these passwords** by updating the bcrypt hashes in `server/routes/auth.js` or implementing a password change feature.

---

## Reverse Proxy (Nginx)

Recommended for production to handle SSL, caching, and clean URLs.

### Install Nginx

```bash
# Ubuntu/Debian
sudo apt-get install -y nginx

# Rocky/RHEL
sudo dnf install -y nginx
```

### Configure

```bash
sudo tee /etc/nginx/conf.d/hrms.conf > /dev/null <<'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS (uncomment after SSL is set up)
    # return 301 https://$host$request_uri;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx   # Debian/Ubuntu
sudo dnf install -y certbot python3-certbot-nginx        # Rocky/RHEL

sudo certbot --nginx -d your-domain.com
```

---

## Backup & Restore

### Database backup

```bash
# Full backup
PGPASSWORD='<password>' pg_dump -h localhost -U sap_user -d sap -F c -f backup_$(date +%Y%m%d).dump

# Restore
PGPASSWORD='<password>' pg_restore -h localhost -U sap_user -d sap -c backup_YYYYMMDD.dump
```

### Automated daily backups

```bash
sudo tee /etc/cron.d/hrms-backup > /dev/null <<'EOF'
0 2 * * * hrms-app PGPASSWORD='<password>' pg_dump -h localhost -U sap_user -d sap -F c -f /opt/hrms-app/backups/backup_$(date +\%Y\%m\%d).dump 2>&1 | logger -t hrms-backup
0 3 * * * hrms-app find /opt/hrms-app/backups -name "*.dump" -mtime +30 -delete
EOF
```

```bash
sudo -u hrms-app mkdir -p /opt/hrms-app/backups
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Server error` on login | Missing `JWT_SECRET` in `.env` | Add `JWT_SECRET` to `.env` and restart |
| `Error fetching organizations` | DB not running or wrong port | Check `DB_PORT` in `.env`, verify PostgreSQL is running |
| `ECONNREFUSED` on port 5432 | PostgreSQL not running | `sudo systemctl start postgresql` |
| Docker: `DB_PASSWORD is required` | Missing `.env` file | Create `.env` from `.env.example` |
| `relation "sap_hcm" does not exist` | Schema not loaded | Run the SQL files in order (02, 03, 04) |
| `function update_updated_at_char_column() does not exist` | Missing trigger function | See "Set up PostgreSQL" section above |
| Frontend shows blank page | Client not built | Run `cd client && npm run build` |
| 502 Bad Gateway (Nginx) | App not running | `sudo systemctl status hrms-app` |

### View logs

```bash
# Systemd
journalctl -u hrms-app -f --no-pager

# Docker
docker compose logs -f app

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log   # Debian
sudo tail -f /var/lib/pgsql/data/log/*.log                # Rocky
```

---

## Security Checklist

Before going live, ensure:

- [ ] `.env` file has strong, unique `DB_PASSWORD` and `JWT_SECRET`
- [ ] `.env` file permissions are `600` (owner read/write only)
- [ ] Default login passwords (`admin123`) are changed
- [ ] PostgreSQL only accepts connections from localhost (check `pg_hba.conf`)
- [ ] Nginx is configured with SSL/TLS (Let's Encrypt or your own certs)
- [ ] Firewall allows only ports 80, 443, and SSH (22)
- [ ] Node.js app runs as a non-root user
- [ ] Database backups are configured and tested
- [ ] `NODE_ENV=production` is set

### Firewall setup

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# firewalld (Rocky/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Environment Variables Reference

| Variable      | Description              | Default   | Required |
|--------------|-------------------------|-----------|----------|
| `NODE_ENV`    | Environment mode         | —         | Yes      |
| `PORT`        | App listening port       | `5000`    | No       |
| `DB_HOST`     | Database host            | —         | Yes      |
| `DB_PORT`     | Database port            | `5432`    | No       |
| `DB_NAME`     | Database name            | —         | Yes      |
| `DB_USER`     | Database user            | —         | Yes      |
| `DB_PASSWORD` | Database password        | —         | Yes      |
| `JWT_SECRET`  | Token signing secret     | —         | Yes      |

---

## Updating the Application

```bash
# Docker
cd /opt/hrms-app
git pull
docker compose up -d --build

# Bare-metal
cd /opt/hrms-app
git pull
npm ci --only=production
cd client && npm ci && npm run build && cd ..
sudo systemctl restart hrms-app
```
