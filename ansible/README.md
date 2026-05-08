# HRMS Application - Ansible Deployment

This directory contains Ansible playbooks and configuration files for deploying the HRMS Application on Rocky Linux 9 servers.

## Quick Start

1. **Install Ansible**
   ```bash
   pip3 install ansible
   ```

2. **Configure your servers** - edit `inventory.ini`:
   ```ini
   [rocky_servers]
   rocky-server ansible_host=192.168.1.100 ansible_user=root
   ```

3. **Set credentials**
   ```bash
   export DB_PASSWORD=$(openssl rand -base64 32)
   export JWT_SECRET=$(openssl rand -base64 64)
   ```

4. **Deploy**
   ```bash
   ./deploy.sh
   ```

## Prerequisites

### Control Machine (where you run Ansible)
- Ansible 2.9+
- Python 3.6+
- SSH key access to target servers

### Target Servers
- Rocky Linux 9
- Root access or sudo user
- SSH server running
- Internet access for package installation

## File Structure

```
ansible/
├── playbook.yml                # Main Ansible playbook
├── inventory.ini               # Server inventory
├── ansible.cfg                 # Ansible configuration
├── deploy.sh                   # Deployment script
├── templates/
│   ├── env.j2                  # Environment variables
│   ├── ecosystem.config.js.j2  # PM2 configuration
│   ├── nginx.conf.j2           # Nginx site configuration
│   └── nginx-main.conf.j2     # Main Nginx configuration
└── README.md
```

## Configuration

### Application Variables

The playbook uses these configurable variables (in `playbook.yml`):

```yaml
vars:
  app_name: "hrms-app"
  app_user: "hrms-app"
  app_dir: "/opt/hrms-app"
  node_version: "18"
  db_name: "sap"
  db_user: "sap_user"
  db_password: "{{ lookup('env', 'DB_PASSWORD') }}"
  app_port: 5000
```

**Important:** Set `DB_PASSWORD` and `JWT_SECRET` environment variables before deployment.

## Deployment Options

### Using the deployment script (Recommended)
```bash
./deploy.sh check        # Check prerequisites only
./deploy.sh test         # Check prerequisites and test connectivity
./deploy.sh deploy       # Full deployment (default)
./deploy.sh force-deploy # Deploy without connectivity test
```

### Direct Ansible commands
```bash
ansible all -m ping                              # Test connectivity
ansible-playbook playbook.yml                    # Run the playbook
ansible-playbook playbook.yml --limit prod-server # Deploy to specific host
ansible-playbook playbook.yml --check            # Dry run
```

## What Gets Deployed

### System Components
- **Node.js 18** - JavaScript runtime
- **PostgreSQL 15** - Database server
- **Nginx** - Reverse proxy
- **PM2** - Process manager

### Application Structure on Server
```
/opt/hrms-app/
├── server/              # Backend API
├── client/build/        # Built React frontend
├── sql/                 # Database schema
├── logs/                # Application logs
├── .env                 # Environment configuration
└── ecosystem.config.js  # PM2 configuration
```

### Services and Ports
| Service     | Port | Access   |
|------------|------|----------|
| Nginx      | 80   | External |
| Node.js    | 5000 | Internal |
| PostgreSQL | 5432 | Internal |

## Post-Deployment Management

```bash
# Application (as hrms-app user)
sudo -u hrms-app pm2 status
sudo -u hrms-app pm2 logs
sudo -u hrms-app pm2 restart hrms-app

# System services
sudo systemctl status nginx
sudo systemctl status postgresql

# Database
sudo -u postgres psql -d sap
```

## Troubleshooting

| Problem | Check |
|---------|-------|
| App not starting | `sudo -u hrms-app pm2 logs` |
| DB connection failed | `sudo systemctl status postgresql` |
| Nginx 502 | `sudo -u hrms-app pm2 status` and `sudo nginx -t` |
| Port conflict | `sudo ss -tlnp \| grep :5000` |
| Firewall blocking | `sudo firewall-cmd --list-all` |

### Log Locations
- **Application**: `/opt/hrms-app/logs/`
- **Nginx**: `/var/log/nginx/`
- **PostgreSQL**: `/var/lib/pgsql/data/log/`
- **System**: `journalctl`

## Updates

```bash
# Re-run the playbook
ansible-playbook playbook.yml

# Or update manually on the server
sudo -u hrms-app -i
cd /opt/hrms-app
git pull origin main
npm install
cd client && npm run build && cd ..
pm2 restart hrms-app
```
