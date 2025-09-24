# SAP Simulation Application - Production Deployment Guide

This guide explains how to deploy the SAP simulation application to a production virtual machine.

## Prerequisites

- Ubuntu/CentOS/RHEL VM with sudo access
- Docker and Docker Compose installed
- Port 80 and 443 open for HTTP/HTTPS traffic
- Domain name pointed to your VM (optional, for SSL)

## Quick Production Setup

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url> /opt/sap-app
cd /opt/sap-app

# Create production environment file
cp .env .env.production
```

### 2. Update Production Configuration

Edit `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sap
DB_USER=sap_user
DB_PASSWORD=P6v5AbvmO_EZQWVI.CqN8f8S

# Security
JWT_SECRET=your-super-secure-jwt-secret-here-change-this

# Optional: SSL Configuration
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
```

**IMPORTANT:** Change the following values for production:
- `JWT_SECRET`: Generate a secure random string
- `DB_PASSWORD`: Use a strong database password
- SSL certificates if using HTTPS

### 3. Deploy with Docker Compose

```bash
# Start the application
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Web Interface**: http://your-server-ip:5000
- **Default Login**:
  - Username: `admin`
  - Password: `admin123`

## Advanced Configuration Options

### Custom Database Configuration

If you want to use an external PostgreSQL database, update the configuration file `/config/database.js`:

```javascript
// Example for external database
production: {
  host: 'your-db-server.com',
  port: 5432,
  database: 'sap_production',
  username: 'sap_user',
  password: 'your-secure-password',
  dialect: 'postgres',
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
}
```

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended):
```bash
# Install certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com
```

2. Update docker-compose.yml to include SSL:
```yaml
services:
  app:
    environment:
      - SSL_CERT_PATH=/etc/ssl/certs/cert.pem
      - SSL_KEY_PATH=/etc/ssl/private/key.pem
    volumes:
      - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/ssl/certs/cert.pem
      - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/ssl/private/key.pem
    ports:
      - "443:5000"
```

### Nginx Reverse Proxy (Recommended)

Create `/etc/nginx/sites-available/sap-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
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
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/sap-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Schema Updates

If you need to update the database schema or data:

1. Connect to the PostgreSQL container:
```bash
docker exec -it sap-postgres psql -U sap_user -d sap
```

2. Or run SQL files:
```bash
docker exec -i sap-postgres psql -U sap_user -d sap < /path/to/your/schema.sql
```

## Monitoring and Maintenance

### Health Checks

Check application status:
```bash
# Check containers
docker-compose ps

# Check application health
curl http://localhost:5000/api/auth/login -d '{"username":"admin","password":"admin123"}' -H "Content-Type: application/json"
```

### Backup Database

```bash
# Backup database
docker exec sap-postgres pg_dump -U sap_user sap > backup-$(date +%Y%m%d).sql

# Restore database
docker exec -i sap-postgres psql -U sap_user -d sap < backup-20250924.sql
```

### Log Management

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Rotate logs (add to crontab)
0 2 * * * docker system prune -f
```

## Security Considerations

1. **Change Default Credentials**: Update admin password in the authentication system
2. **Database Security**: Use strong passwords and limit database access
3. **Network Security**: Use firewall rules to restrict access
4. **SSL/TLS**: Always use HTTPS in production
5. **Updates**: Keep Docker images and system packages updated

## Troubleshooting

### Common Issues

1. **Port already in use**:
   ```bash
   sudo netstat -tlnp | grep :5000
   sudo systemctl stop apache2  # or nginx
   ```

2. **Database connection issues**:
   ```bash
   docker-compose logs postgres
   docker exec -it sap-postgres psql -U sap_user -d sap
   ```

3. **Application not starting**:
   ```bash
   docker-compose logs app
   # Check environment variables and file permissions
   ```

### Getting Support

- Check logs: `docker-compose logs`
- Verify configuration: Review `.env.production` file
- Database connectivity: Test database connection manually
- Network issues: Check firewall and port configurations

## Configuration Reference

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| NODE_ENV | Environment mode | development | Yes |
| PORT | Application port | 3001 | Yes |
| DB_HOST | Database host | localhost | Yes |
| DB_PORT | Database port | 5432 | Yes |
| DB_NAME | Database name | sap | Yes |
| DB_USER | Database username | sap_user | Yes |
| DB_PASSWORD | Database password | - | Yes |
| JWT_SECRET | JWT signing secret | - | Yes |

### Default User Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| admin | admin123 | admin | System Administrator |
| hr_manager | admin123 | hr | HR Manager |

**IMPORTANT**: Change these passwords in production by updating the authentication system.