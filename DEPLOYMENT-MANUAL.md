# SAP HCM/OM Simulation - Complete Deployment Manual
*Version 2.0 - Updated with Production Data & Latest Features*

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start Deployment](#quick-start-deployment)
- [Detailed Deployment Options](#detailed-deployment-options)
- [Production Data Migration](#production-data-migration)
- [Configuration](#configuration)
- [Security & SSL Setup](#security--ssl-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [API Documentation](#api-documentation)

---

## 🎯 Overview

This application is a comprehensive SAP HCM (Human Capital Management) and OM (Organizational Management) simulation featuring:

### Key Features
- **🎨 SAP Fiori-inspired UI** - Modern React/TypeScript frontend with Material-UI
- **👥 Employee Management** - Complete CRUD operations with auto-generated personnel numbers
- **🏢 Organization Management** - Hierarchical organizational structure
- **📊 Dashboard Analytics** - Real-time statistics and visualizations
- **🔐 JWT Authentication** - Secure role-based access control
- **📱 Responsive Design** - Works on desktop, tablet, and mobile
- **🗄️ Production Data** - 2,004+ realistic employee records from German university

### Architecture
- **Backend**: Node.js 18+ with Express.js
- **Frontend**: React 18 with TypeScript and Material-UI
- **Database**: PostgreSQL 15+
- **Authentication**: JWT with role-based access
- **Deployment**: Docker Compose (recommended) or manual setup

---

## ⚙️ Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+, CentOS 8+, or compatible Linux distribution
- **RAM**: Minimum 4GB (8GB recommended for production)
- **Storage**: 20GB available disk space
- **CPU**: 2+ cores recommended
- **Network**: Open ports 80, 443 (if using SSL), and 5000 (application port)

### Software Dependencies
- **Docker**: 20.10+ with Docker Compose v2
- **Git**: For cloning the repository
- **Optional**: Nginx for reverse proxy and SSL termination

### Installation of Prerequisites

#### Ubuntu/Debian
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose (if not included)
sudo apt install docker-compose-plugin

# Install Git and other utilities
sudo apt install git curl wget nano
```

#### CentOS/RHEL/Fedora
```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Git and utilities
sudo yum install git curl wget nano
```

---

## 🚀 Quick Start Deployment

### 1. Clone Repository
```bash
# Clone the repository
git clone <your-repository-url> /opt/sap-app
cd /opt/sap-app

# Make deployment scripts executable
chmod +x scripts/*.sh
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env .env.production

# Generate strong JWT secret
openssl rand -base64 64

# Edit configuration file
nano .env.production
```

**Required Environment Variables:**
```env
# Application Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sap
DB_USER=sap_user
DB_PASSWORD=P6v5AbvmO_EZQWVI.CqN8f8S

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secure-jwt-secret-generated-above

# Optional: SSL Configuration
SSL_ENABLED=false
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
```

### 3. Deploy Application
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Load Production Data
```bash
# Wait for database to be ready (30-60 seconds)
sleep 60

# Load production data (2,004+ employee records)
docker-compose exec postgres psql -U sap_user -d sap < sql/sap.sql
```

### 5. Verify Deployment
```bash
# Check application health
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6. Access Application
- **URL**: `http://your-server-ip:5000`
- **Admin Login**:
  - Username: `admin`
  - Password: `admin123`
- **HR Manager Login**:
  - Username: `hr_manager`
  - Password: `admin123`

**⚠️ IMPORTANT**: Change default passwords immediately after first login!

---

## 🔧 Detailed Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Development Environment
```bash
# Use development configuration
docker-compose -f docker-compose.dev.yml up -d

# Enable hot reload for development
docker-compose -f docker-compose.dev.yml exec app npm run server:dev
```

#### Production Environment
```bash
# Use production configuration
docker-compose -f docker-compose.yml up -d

# Scale application for high availability
docker-compose up -d --scale app=3
```

### Option 2: Manual Installation

#### 1. Database Setup
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createuser -P sap_user  # Enter password: P6v5AbvmO_EZQWVI.CqN8f8S
sudo -u postgres createdb -O sap_user sap

# Initialize schema
sudo -u postgres psql -d sap < sql/01-sap-schema.sql
sudo -u postgres psql -d sap < sql/02-sap-hcm-schema.sql
sudo -u postgres psql -d sap < sql/03-sap-om-schema.sql
```

#### 2. Application Setup
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install application dependencies
npm install --production
cd client && npm install && npm run build && cd ..

# Install process manager
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option 3: Kubernetes Deployment

#### Create Kubernetes Manifests
```yaml
# sap-app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sap-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sap-app
  template:
    metadata:
      labels:
        app: sap-app
    spec:
      containers:
      - name: sap-app
        image: your-registry/sap-app:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: sap-secrets
              key: jwt-secret
```

---

## 🗄️ Production Data Migration

### Current Database State
The application comes with realistic production data:
- **Employees**: 2,004 German university staff records
- **Organizations**: 227 organizational units (Lehrstühle, departments, teams)
- **Realistic Data**: Academic titles, German locations, proper hierarchies

### Loading Production Data
```bash
# Method 1: Using provided SQL dump
PGPASSWORD=P6v5AbvmO_EZQWVI.CqN8f8S psql -h localhost -p 5433 -U sap_user -d sap < sql/sap.sql

# Method 2: Step-by-step loading
psql -h localhost -p 5433 -U sap_user -d sap < sql/production/sap_hcm_data.sql
psql -h localhost -p 5433 -U sap_user -d sap < sql/production/sap_om_data.sql

# Method 3: Docker environment
docker-compose exec postgres psql -U sap_user -d sap < sql/sap.sql
```

### Data Validation
```bash
# Verify employee count
psql -h localhost -p 5433 -U sap_user -d sap -c "SELECT COUNT(*) FROM sap_hcm;"
# Expected: 2004

# Verify organization count
psql -h localhost -p 5433 -U sap_user -d sap -c "SELECT COUNT(*) FROM sap_om;"
# Expected: 227

# Test API with production data
curl -X GET "http://localhost:5000/api/employees?limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Custom Data Import
```bash
# Prepare your own CSV files
# employees.csv: pernr,firstname,lastname,email,orgeh,job,...
# organizations.csv: objid,short,stext,org_level,...

# Use import scripts
node scripts/import-employees.js employees.csv
node scripts/import-organizations.js organizations.csv
```

---

## ⚙️ Configuration

### Environment Variables Reference

#### Application Settings
```env
NODE_ENV=production          # Application environment
PORT=5000                   # Application port
LOG_LEVEL=info              # Logging level (debug, info, warn, error)
CORS_ORIGIN=*               # CORS allowed origins
```

#### Database Configuration
```env
DB_HOST=postgres            # Database host
DB_PORT=5432               # Database port
DB_NAME=sap                # Database name
DB_USER=sap_user           # Database username
DB_PASSWORD=strong_password # Database password
DB_SSL=false               # Enable SSL for database
DB_POOL_MIN=2              # Minimum pool connections
DB_POOL_MAX=10             # Maximum pool connections
```

#### Security Settings
```env
JWT_SECRET=your-256-bit-secret    # JWT signing secret (REQUIRED)
JWT_EXPIRES_IN=8h                 # JWT expiration time
BCRYPT_ROUNDS=12                  # Password hashing rounds
RATE_LIMIT_WINDOW=15              # Rate limiting window (minutes)
RATE_LIMIT_MAX=100                # Max requests per window
```

#### Optional Features
```env
REDIS_URL=redis://localhost:6379  # Redis for caching/sessions
SMTP_HOST=localhost               # Email server for notifications
SMTP_PORT=587                     # SMTP port
SMTP_USER=user@example.com        # SMTP username
SMTP_PASS=password                # SMTP password
```

### Docker Compose Configuration

#### Production Configuration
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sap
      POSTGRES_USER: sap_user
      POSTGRES_PASSWORD: P6v5AbvmO_EZQWVI.CqN8f8S
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./sql:/docker-entrypoint-initdb.d
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 🔒 Security & SSL Setup

### SSL Certificate Setup

#### Using Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Self-Signed Certificate (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Move certificates
sudo mkdir -p /etc/ssl/private /etc/ssl/certs
sudo mv key.pem /etc/ssl/private/
sudo mv cert.pem /etc/ssl/certs/
```

### Nginx Configuration with SSL
```nginx
# /etc/nginx/sites-available/sap-app
upstream sap_backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001 backup;  # If running multiple instances
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Security Headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Proxy Configuration
    location / {
        proxy_pass http://sap_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://sap_backend;
    }

    # Security: Block access to sensitive files
    location ~ /\.(env|git) {
        deny all;
        return 404;
    }
}
```

### Enable and Test Nginx
```bash
# Test configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/sap-app /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl reload nginx

# Test SSL
curl -I https://yourdomain.com
```

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 5000  # Block direct access to application
sudo ufw --force enable

# iptables (Alternative)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 5000 -s 127.0.0.1 -j ACCEPT
iptables -A INPUT -p tcp --dport 5000 -j DROP
```

---

## 📊 Monitoring & Maintenance

### Application Monitoring

#### Health Check Endpoints
```bash
# Application health
curl http://localhost:5000/api/health

# Database connectivity
curl http://localhost:5000/api/health/db

# Detailed system info (admin only)
curl -H "Authorization: Bearer $JWT_TOKEN" http://localhost:5000/api/health/detailed
```

#### Log Management
```bash
# Docker Compose logs
docker-compose logs -f --tail=100 app
docker-compose logs -f --tail=100 postgres

# Application logs (if using PM2)
pm2 logs sap-app

# System logs
sudo journalctl -u sap-app -f

# Log rotation setup
sudo nano /etc/logrotate.d/sap-app
```

### Performance Monitoring

#### Install monitoring tools
```bash
# Install Node.js monitoring
npm install -g pm2
pm2 install pm2-server-monit

# Install system monitoring
sudo apt install htop iotop nethogs

# Optional: Install Prometheus & Grafana
docker run -d -p 9090:9090 prom/prometheus
docker run -d -p 3000:3000 grafana/grafana
```

#### Database Monitoring
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('sap')) as database_size;

-- Monitor active connections
SELECT count(*) as active_connections FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Backup Strategy

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/sap-app"
DB_NAME="sap"
DB_USER="sap_user"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "Creating database backup..."
PGPASSWORD=P6v5AbvmO_EZQWVI.CqN8f8S pg_dump -h localhost -U $DB_USER $DB_NAME > "$BACKUP_DIR/db_backup_$DATE.sql"

# Application backup
echo "Creating application backup..."
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" /opt/sap-app --exclude="node_modules" --exclude=".git"

# Cleanup old backups
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR"
```

#### Schedule Backups
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /opt/sap-app/scripts/backup.sh >> /var/log/sap-backup.log 2>&1

# Weekly full backup to remote location
0 3 * * 0 /opt/sap-app/scripts/backup.sh && rsync -av /opt/backups/ user@backup-server:/backups/sap-app/
```

### Updates and Maintenance

#### Application Updates
```bash
#!/bin/bash
# update.sh

echo "Starting SAP App update process..."

# Backup current version
./scripts/backup.sh

# Stop application
docker-compose down

# Pull latest changes
git pull origin main

# Update dependencies
npm install --production
cd client && npm install && npm run build && cd ..

# Start application
docker-compose up -d

# Verify deployment
sleep 30
curl -f http://localhost:5000/api/health || echo "Health check failed!"

echo "Update completed successfully!"
```

#### Database Maintenance
```sql
-- Run weekly maintenance
VACUUM ANALYZE;

-- Update table statistics
ANALYZE sap_hcm;
ANALYZE sap_om;

-- Check for bloated tables
SELECT
  schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

---

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start
```bash
# Check Docker services
docker-compose ps

# Check application logs
docker-compose logs app

# Common fixes:
# - Check port 5000 is not in use
sudo netstat -tlnp | grep :5000

# - Verify environment variables
docker-compose exec app printenv | grep -E "(NODE_ENV|DB_|JWT_)"

# - Check database connection
docker-compose exec app node -e "console.log(require('./server/config/database.js'))"
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U sap_user

# Test database connection
docker-compose exec postgres psql -U sap_user -d sap -c "SELECT version();"

# Check database logs
docker-compose logs postgres

# Reset database connection
docker-compose restart postgres
sleep 10
docker-compose restart app
```

#### 3. Frontend Build/Loading Issues
```bash
# Check if build was successful
ls -la client/build/

# Rebuild frontend
cd client
rm -rf build node_modules
npm install
npm run build
cd ..

# Check if static files are served
curl -I http://localhost:5000/static/css/
```

#### 4. Authentication Issues
```bash
# Check JWT secret is set
docker-compose exec app node -e "console.log('JWT Secret length:', process.env.JWT_SECRET?.length)"

# Test authentication endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' -v

# Check user table
docker-compose exec postgres psql -U sap_user -d sap -c "SELECT * FROM users;"
```

#### 5. Performance Issues
```bash
# Check system resources
htop
df -h
free -h

# Check application memory usage
docker stats

# Analyze slow queries
docker-compose exec postgres psql -U sap_user -d sap -c "
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;"

# Check database locks
docker-compose exec postgres psql -U sap_user -d sap -c "
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
WHERE NOT blocked_locks.granted;"
```

### Emergency Recovery Procedures

#### Application Recovery
```bash
# Quick restart
docker-compose restart

# Full reset (destroys data!)
docker-compose down -v
docker-compose up -d

# Restore from backup
./scripts/restore.sh /opt/backups/sap-app/backup_20240924_120000.tar.gz
```

#### Database Recovery
```bash
# Restore database from backup
docker-compose exec -T postgres psql -U sap_user -d sap < /path/to/backup.sql

# Reset database to initial state
docker-compose exec postgres psql -U sap_user -d sap < sql/reset.sql
docker-compose exec postgres psql -U sap_user -d sap < sql/sap.sql
```

---

## 🚄 Performance Optimization

### Application Optimization

#### Node.js Configuration
```javascript
// server/config/performance.js
module.exports = {
  cluster: {
    enabled: process.env.NODE_ENV === 'production',
    workers: require('os').cpus().length
  },
  compression: {
    enabled: true,
    threshold: 1024,
    level: 6
  },
  cache: {
    ttl: 300, // 5 minutes
    max: 1000 // max items in cache
  }
};
```

#### Enable Clustering
```javascript
// server/cluster.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  require('./index.js');
  console.log(`Worker ${process.pid} started`);
}
```

### Database Optimization

#### Add Performance Indexes
```sql
-- Employee search optimization
CREATE INDEX CONCURRENTLY idx_sap_hcm_search
ON sap_hcm USING gin(to_tsvector('german', firstname || ' ' || lastname || ' ' || email));

-- Organization hierarchy optimization
CREATE INDEX CONCURRENTLY idx_sap_om_hierarchy
ON sap_om (parent_objid, org_level);

-- Date range queries
CREATE INDEX CONCURRENTLY idx_sap_hcm_dates
ON sap_hcm (begda, endda) WHERE endda > CURRENT_DATE;

-- Foreign key optimization
CREATE INDEX CONCURRENTLY idx_sap_hcm_orgeh
ON sap_hcm (orgeh);
```

#### PostgreSQL Configuration
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Recommended settings for 8GB RAM system
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 16MB
wal_buffers = 16MB
checkpoint_completion_target = 0.9
wal_level = replica
max_wal_senders = 3
max_connections = 100
```

### Caching Strategy

#### Redis Integration
```javascript
// server/config/redis.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Cache middleware
const cache = (ttl = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Store original json method
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(key, ttl, JSON.stringify(data));
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

module.exports = { client, cache };
```

#### CDN Configuration
```nginx
# Nginx static file caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;

    # Gzip compression
    gzip on;
    gzip_comp_level 6;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

### Load Testing

#### Install Artillery
```bash
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
scenarios:
  - name: "Employee API Test"
    requests:
      - post:
          url: "/api/auth/login"
          json:
            username: "admin"
            password: "admin123"
        capture:
          - json: "$.token"
            as: "token"
      - get:
          url: "/api/employees"
          headers:
            Authorization: "Bearer {{ token }}"
EOF

# Run load test
artillery run load-test.yml
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "fullName": "System Administrator"
  }
}
```

### Employee Management Endpoints

#### List Employees
```bash
GET /api/employees?page=1&limit=20&search=john&orgeh=1001
Authorization: Bearer <token>

# Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2004,
    "pages": 101
  }
}
```

#### Get Employee Details
```bash
GET /api/employees/:pernr
Authorization: Bearer <token>

# Response includes org information:
{
  "pernr": "10001",
  "firstname": "John",
  "lastname": "Doe",
  "org_name": "IT Department",
  "org_short": "IT",
  ...
}
```

#### Create Employee
```bash
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstname": "Jane",
  "lastname": "Smith",
  "email": "jane.smith@company.com",
  "orgeh": "1001",
  "job": "Software Developer",
  "begda": "24.09.2024",
  "endda": "31.12.2099"
}

# Note: Personnel number is auto-generated starting from 30000
```

#### Update Employee
```bash
PUT /api/employees/:pernr
Authorization: Bearer <token>
Content-Type: application/json

{
  "job": "Senior Software Developer",
  "contract_type": "unbefristet",
  "email": "john.doe@company.com"
}
```

### Organization Management Endpoints

#### List Organizations
```bash
GET /api/organizations
Authorization: Bearer <token>

# Response includes hierarchical structure:
{
  "data": [
    {
      "objid": "1001",
      "short": "IT",
      "stext": "IT Department",
      "org_level": "Abteilung",
      "parent_objid": "1000",
      "employee_count": 45
    }
  ]
}
```

#### Get Organization Details
```bash
GET /api/organizations/:objid
Authorization: Bearer <token>

# Response includes employees and sub-organizations:
{
  "objid": "1001",
  "stext": "IT Department",
  "employees": [...],
  "subOrganizations": [...]
}
```

### Health Check Endpoints

```bash
# Basic health check
GET /api/health

# Database connectivity check
GET /api/health/db
Authorization: Bearer <token>

# Detailed system information
GET /api/health/detailed
Authorization: Bearer <token>
```

---

## 📱 Feature Overview

### Current Features

#### ✅ Employee Management
- **CRUD Operations**: Create, read, update employees
- **Auto-numbering**: Personnel numbers start from 30000
- **Search & Filter**: Full-text search across names, emails, personnel numbers
- **Validation**: Comprehensive form validation with German date formats
- **Rich Data**: Academic titles, locations, contract types, work schedules

#### ✅ Organization Management
- **Hierarchical Structure**: Multi-level org charts
- **Department Views**: Browse by organizational units
- **Employee Assignment**: Link employees to organizations
- **Statistics**: Employee counts per organization

#### ✅ Dashboard Analytics
- **Key Metrics**: Total employees, active contracts, departments
- **Visualizations**: Pie charts (locations) and bar charts (org types)
- **Real-time Data**: Live statistics from database

#### ✅ Authentication & Security
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Admin and HR Manager roles
- **Form Security**: Input validation and sanitization

#### ✅ User Interface
- **SAP Fiori Design**: Material-UI components with SAP styling
- **Responsive**: Works on desktop, tablet, mobile
- **German Localization**: Date formats, academic titles
- **Consistent Colors**: Contract type color coding across views

### Upcoming Features (Roadmap)

#### 🔄 Phase 2 - Enhanced Functionality
- **Advanced Search**: Filters by date ranges, contract types, locations
- **Bulk Operations**: Import/export employees via CSV/Excel
- **Audit Trail**: Track all changes to employee records
- **Document Management**: Upload and manage employee documents

#### 🔄 Phase 3 - Advanced SAP Features
- **Payroll Integration**: Basic salary and benefits tracking
- **Time Management**: Work time recording and approval
- **Reporting**: Advanced reports and analytics
- **Workflow**: Approval processes for changes

---

This deployment manual provides comprehensive guidance for deploying and maintaining the SAP HCM/OM simulation application. For additional support or questions, please refer to the troubleshooting section or check the application logs.

**Remember**: This is a simulation application for educational/development purposes and is not affiliated with SAP SE.