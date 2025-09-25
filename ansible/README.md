# SAP HCM Application - Ansible Deployment

This directory contains Ansible playbooks and configuration files for deploying the SAP HCM Application on Rocky Linux servers.

## 🚀 Quick Start

1. **Install Ansible**
   ```bash
   pip3 install ansible
   ```

2. **Configure your servers**
   Edit `inventory.ini` with your Rocky Linux server details:
   ```ini
   [rocky_servers]
   rocky-server ansible_host=192.168.1.100 ansible_user=root
   ```

3. **Deploy**
   ```bash
   ./deploy.sh
   ```

## 📋 Prerequisites

### Control Machine (where you run Ansible)
- Ansible 2.9+
- Python 3.6+
- SSH key access to target servers

### Target Servers (Rocky Linux)
- Rocky Linux 8.x or 9.x
- Root access or sudo user
- SSH server running
- Internet access for package installation

## 📁 File Structure

```
ansible/
├── playbook.yml          # Main Ansible playbook
├── inventory.ini          # Server inventory (configure your servers here)
├── ansible.cfg           # Ansible configuration
├── deploy.sh             # Deployment script
├── templates/            # Configuration templates
│   ├── env.j2           # Environment variables
│   ├── ecosystem.config.js.j2  # PM2 configuration
│   ├── nginx.conf.j2    # Nginx site configuration
│   └── nginx-main.conf.j2       # Main Nginx configuration
└── README.md            # This file
```

## ⚙️ Configuration

### 1. Server Inventory

Edit `inventory.ini` to add your Rocky Linux servers:

```ini
[rocky_servers]
# Production server
prod-server ansible_host=192.168.1.100 ansible_user=root

# Development server
dev-server ansible_host=10.0.0.50 ansible_user=centos ansible_become=yes

# Multiple servers
web1 ansible_host=192.168.1.101 ansible_user=rocky
web2 ansible_host=192.168.1.102 ansible_user=rocky

[rocky_servers:vars]
ansible_python_interpreter=/usr/bin/python3
```

### 2. Application Variables

The playbook uses these configurable variables in `playbook.yml`:

```yaml
vars:
  app_name: "sap-hcm-app"
  app_user: "sap-app"
  app_dir: "/opt/sap-hcm-app"
  node_version: "18"
  postgres_version: "15"
  db_name: "sap"
  db_user: "sap_user"
  db_password: "P6v5AbvmO_EZQWVI.CqN8f8S"  # Change this!
  app_port: 3001
  client_port: 3000
```

**⚠️ Important:** Change the database password before deployment!

## 🚀 Deployment Options

### Option 1: Using the deployment script (Recommended)
```bash
# Check prerequisites
./deploy.sh check

# Test connectivity
./deploy.sh test

# Full deployment
./deploy.sh deploy

# Deploy without connectivity test
./deploy.sh force-deploy
```

### Option 2: Direct Ansible commands
```bash
# Test connectivity
ansible all -m ping

# Run the playbook
ansible-playbook playbook.yml

# Run with extra verbosity
ansible-playbook playbook.yml -vvv

# Deploy to specific hosts
ansible-playbook playbook.yml --limit prod-server

# Dry run (check what would change)
ansible-playbook playbook.yml --check
```

## 🏗️ What Gets Deployed

### System Components
- **Node.js 18** - JavaScript runtime
- **PostgreSQL 15** - Database server
- **Nginx** - Web server and reverse proxy
- **PM2** - Process manager for Node.js
- **Firewalld** - Firewall configuration

### Application Structure
```
/opt/sap-hcm-app/
├── server/              # Backend API server
├── client/              # React frontend
│   └── build/          # Built React app
├── sql/                # Database schema files
├── logs/               # Application logs
├── .env                # Environment configuration
├── ecosystem.config.js # PM2 configuration
└── node_modules/       # Dependencies
```

### Services
- **Application**: Runs on port 3001 (internal)
- **Nginx**: Serves on port 80 (external)
- **PostgreSQL**: Runs on port 5432
- **PM2**: Manages Node.js processes

## 🔧 Post-Deployment Management

### Application Management
```bash
# Switch to application user
sudo -u sap-app -i

# PM2 commands
pm2 status                    # Check application status
pm2 logs                      # View logs
pm2 restart sap-hcm-app      # Restart application
pm2 stop sap-hcm-app         # Stop application
pm2 start sap-hcm-app        # Start application
pm2 reload sap-hcm-app       # Zero-downtime reload
```

### System Services
```bash
# Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
sudo systemctl reload nginx

# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql

# View logs
sudo journalctl -u nginx -f
sudo journalctl -u postgresql -f
```

### Database Management
```bash
# Connect to database
sudo -u postgres psql -d sap

# As application user
PGPASSWORD=your_password psql -h localhost -U sap_user -d sap

# Backup database
sudo -u postgres pg_dump sap > /tmp/sap_backup.sql

# Restore database
sudo -u postgres psql sap < /tmp/sap_backup.sql
```

## 🔒 Security Features

### Network Security
- **Firewall**: Only HTTP (80), HTTPS (443), and optionally PostgreSQL (5432) ports open
- **SELinux**: Properly configured contexts
- **Nginx Security Headers**: XSS protection, content type sniffing prevention

### Application Security
- **Non-root User**: Application runs as dedicated `sap-app` user
- **Environment Variables**: Sensitive data in `.env` file with restricted permissions
- **Process Isolation**: PM2 cluster mode for fault tolerance

### Database Security
- **Authentication**: MD5 password authentication
- **User Permissions**: Limited database user privileges
- **Network Access**: PostgreSQL configured for local connections

## 🐛 Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   ```bash
   # Test SSH manually
   ssh -o StrictHostKeyChecking=no user@server-ip

   # Check SSH key
   ssh-add -l
   ```

2. **Application Not Starting**
   ```bash
   # Check logs
   sudo -u sap-app pm2 logs

   # Check environment
   sudo -u sap-app cat /opt/sap-hcm-app/.env

   # Restart application
   sudo -u sap-app pm2 restart sap-hcm-app
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql

   # Test database connection
   sudo -u postgres psql -c "\\l"

   # Check PostgreSQL logs
   sudo tail -f /var/lib/pgsql/data/log/postgresql-*.log
   ```

4. **Nginx Issues**
   ```bash
   # Test Nginx configuration
   sudo nginx -t

   # Check Nginx logs
   sudo tail -f /var/log/nginx/sap-hcm-app.error.log

   # Reload configuration
   sudo systemctl reload nginx
   ```

5. **Port Issues**
   ```bash
   # Check if ports are in use
   sudo netstat -tlnp | grep :80
   sudo netstat -tlnp | grep :3001

   # Check firewall
   sudo firewall-cmd --list-all
   ```

### Log Locations
- **Application Logs**: `/opt/sap-hcm-app/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/lib/pgsql/data/log/`
- **System Logs**: `journalctl`

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Re-run the playbook to update
ansible-playbook playbook.yml

# Or update manually
sudo -u sap-app -i
cd /opt/sap-hcm-app
git pull origin main
npm install
cd client && npm run build
pm2 restart sap-hcm-app
```

### System Updates
```bash
# Update Rocky Linux
sudo dnf update -y

# Update Node.js (if needed)
sudo dnf module reset nodejs
sudo dnf module install nodejs:18

# Update PostgreSQL (major version upgrades need special handling)
sudo dnf update postgresql*
```

## 📊 Monitoring

### Health Checks
- Application: `http://your-server/health`
- Nginx: `curl -I http://your-server`
- Database: `sudo -u postgres pg_isready`

### Performance Monitoring
```bash
# System resources
htop
df -h
free -h

# Application metrics
sudo -u sap-app pm2 monit

# Database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🆘 Support

For issues with this deployment:

1. Check the troubleshooting section above
2. Review the deployment logs
3. Verify your inventory and variables configuration
4. Test each component individually

---

**Note**: This playbook is designed for Rocky Linux 8.x/9.x. For other distributions, you may need to modify package names and service configurations.