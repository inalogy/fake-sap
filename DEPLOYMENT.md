# SAP HCM/OM Simulation - Deployment Manual

## Overview
This application simulates SAP HCM (Human Capital Management) and OM (Organizational Management) modules with a modern web interface that mimics SAP Fiori design.

## Prerequisites
- Docker and Docker Compose installed on the target VM
- PostgreSQL 15+ (if not using Docker)
- Node.js 18+ (if not using Docker)
- Minimum 2GB RAM
- 10GB disk space

## Architecture
- **Backend**: Node.js with Express.js
- **Frontend**: React with TypeScript and Material-UI
- **Database**: PostgreSQL
- **Authentication**: JWT-based

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository to your VM**
```bash
git clone <repository-url>
cd FakeSAP
```

2. **Set environment variables**
```bash
# Create production .env file
cp .env.example .env
nano .env

# Update these values:
JWT_SECRET=<generate-strong-secret-key>
NODE_ENV=production
```

3. **Build and start with Docker Compose**
```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Verify services are running
docker-compose ps
```

4. **Initialize database** (first time only)
```bash
# The SQL scripts in /sql folder will be automatically executed
# Check if tables are created:
docker exec -it sap-postgres psql -U sap_user -d sap -c "\dt"
```

### Option 2: Manual Deployment

1. **Install PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

2. **Setup Database**
```bash
# Login as postgres user
sudo -u postgres psql

# Execute SQL scripts
\i /path/to/sql/sap_om.sql
\i /path/to/sql/sap_hcm.sql
\q
```

3. **Install Node.js**
```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install Application Dependencies**
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd client
npm install
cd ..
```

5. **Build Frontend**
```bash
cd client
npm run build
cd ..
```

6. **Configure Environment**
```bash
# Edit .env file with your configuration
nano .env

# Required variables:
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sap
DB_USER=sap_user
DB_PASSWORD=P6v5AbvmO_EZQWVI.CqN8f8S
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

7. **Start Application**
```bash
# Using PM2 (recommended for production)
npm install -g pm2
pm2 start server/index.js --name sap-app
pm2 save
pm2 startup

# Or using systemd service (see below)
```

### Option 3: Systemd Service Setup

1. **Create service file**
```bash
sudo nano /etc/systemd/system/sap-app.service
```

2. **Add service configuration**
```ini
[Unit]
Description=SAP HCM/OM Simulation Application
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/FakeSAP
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
Environment=NODE_ENV=production
EnvironmentFile=/path/to/FakeSAP/.env

[Install]
WantedBy=multi-user.target
```

3. **Enable and start service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable sap-app
sudo systemctl start sap-app
sudo systemctl status sap-app
```

## Nginx Configuration (Optional)

For production deployment with SSL:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Default Credentials

The application comes with two default users:

- **Admin User**
  - Username: `admin`
  - Password: `admin123`
  - Role: Administrator

- **HR Manager**
  - Username: `hr_manager`
  - Password: `admin123`
  - Role: HR Manager

**Important**: Change these passwords immediately after deployment!

## Post-Deployment Steps

1. **Access the application**
   - Open browser and navigate to: `http://<vm-ip>:5000`
   - Login with default credentials

2. **Verify functionality**
   - Check Dashboard loads correctly
   - Navigate to Employees section
   - Navigate to Organizations section
   - Test search functionality

3. **Security hardening**
   - Change default passwords
   - Update JWT_SECRET in .env
   - Configure firewall rules
   - Enable SSL/TLS
   - Set up regular backups

## Backup and Recovery

### Database Backup
```bash
# Backup
docker exec sap-postgres pg_dump -U sap_user sap > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i sap-postgres psql -U sap_user sap < backup.sql
```

### Application Backup
```bash
# Backup entire application
tar -czf sap-app-backup-$(date +%Y%m%d).tar.gz /path/to/FakeSAP
```

## Monitoring

### Check Application Logs
```bash
# Docker logs
docker-compose logs -f app

# PM2 logs
pm2 logs sap-app

# Systemd logs
sudo journalctl -u sap-app -f
```

### Health Check Endpoints
- Application: `http://<vm-ip>:5000/api/health`
- Database connection: Check via application logs

## Troubleshooting

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in .env
3. Ensure database user has proper permissions
4. Check firewall rules

### Application Won't Start
1. Check Node.js version (requires v18+)
2. Verify all dependencies are installed
3. Check port 5000 is not in use
4. Review application logs for errors

### Frontend Not Loading
1. Ensure frontend build completed successfully
2. Check if static files are being served
3. Verify proxy settings in package.json

## Performance Optimization

1. **Database**
   - Add indexes for frequently queried columns
   - Regular VACUUM and ANALYZE
   - Monitor query performance

2. **Application**
   - Enable Node.js clustering
   - Implement caching (Redis)
   - Use CDN for static assets

3. **Server**
   - Adjust PostgreSQL configuration
   - Optimize Node.js memory usage
   - Enable gzip compression

## Maintenance

### Regular Tasks
- Weekly database backups
- Monthly security updates
- Monitor disk space
- Review application logs
- Update dependencies quarterly

### Update Procedure
```bash
# Backup current version
./backup.sh

# Pull latest changes
git pull origin main

# Update dependencies
npm install
cd client && npm install && npm run build

# Restart application
docker-compose down
docker-compose up -d
# or
pm2 restart sap-app
```

## Support

For issues or questions:
1. Check application logs
2. Review this documentation
3. Check PostgreSQL logs
4. Verify network connectivity

## SAP-Like Features

The application mimics SAP with:
- Fiori-inspired UI design
- Employee master data management (PA - Personnel Administration)
- Organizational structure visualization (OM - Organizational Management)
- Cost center assignments
- Validity date ranges
- Hierarchical organization tree
- SAP-style data fields (PERNR, OBJID, BEGDA, ENDDA)

## Security Considerations

1. Always use HTTPS in production
2. Implement rate limiting
3. Regular security audits
4. Keep dependencies updated
5. Use strong passwords
6. Enable audit logging
7. Implement backup encryption
8. Use firewall rules to restrict access

## License

This is a simulation application for educational/development purposes only.
Not affiliated with SAP SE.