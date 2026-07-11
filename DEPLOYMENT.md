# Edigital TaskPad Deployment Guide

Domain: `tasktracker.edigitalknowledge.in`

## Prerequisites
- VPS (Ubuntu/Debian recommended)
- Domain name pointed to your VPS IP
- SSH access to VPS

## Step 1: Initial Server Setup

1. SSH into your VPS
2. Update packages:
```bash
sudo apt update && sudo apt upgrade -y
```

3. Install required software:
```bash
sudo apt install -y nginx openjdk-17-jdk maven nodejs npm mysql-server git
```

## Step 2: MySQL Database Setup

1. Secure MySQL installation:
```bash
sudo mysql_secure_installation
```

2. Create database and user:
```bash
sudo mysql -u root -p
```
Then run:
```sql
CREATE DATABASE taskopad;
CREATE USER 'taskpad_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON taskopad.* TO 'taskpad_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Clone/Upload Project

```bash
cd /var/www
sudo mkdir -p tasktracker
sudo chown -R $USER:$USER tasktracker
cd tasktracker
# Clone your repo or upload files here
```

## Step 4: Update Production Configuration

Edit `backend/src/main/resources/application-prod.properties` with your DB credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskopad?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=taskpad_user
spring.datasource.password=your_strong_password
```

## Step 5: Build & Deploy

### Frontend Build:
```bash
cd /var/www/tasktracker
npm install
npm run build
```

### Backend Build:
```bash
cd backend
mvn clean package -DskipTests
cp target/taskpad-0.0.1-SNAPSHOT.jar /var/www/tasktracker/
cd ..
```

## Step 6: Setup Backend as Systemd Service

Create service file:
```bash
sudo nano /etc/systemd/system/taskpad-backend.service
```

Add this content:
```ini
[Unit]
Description=Edigital TaskPad Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/var/www/tasktracker
ExecStart=/usr/bin/java -jar /var/www/tasktracker/taskpad-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable taskpad-backend
sudo systemctl start taskpad-backend
sudo systemctl status taskpad-backend  # Check if running
```

## Step 7: Configure Nginx

1. Copy nginx.conf to sites-available:
```bash
sudo cp /var/www/tasktracker/nginx.conf /etc/nginx/sites-available/tasktracker
```

2. Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/tasktracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site if needed
```

3. Test Nginx config and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Step 8: Setup SSL with Let's Encrypt

1. Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. Obtain and install SSL certificate:
```bash
sudo certbot --nginx -d tasktracker.edigitalknowledge.in -d www.tasktracker.edigitalknowledge.in
```

3. Certbot will automatically update your Nginx config and enable HTTPS!

## Verify Deployment

Visit:
- Frontend: `https://tasktracker.edigitalknowledge.in`
- Backend API Test: `https://tasktracker.edigitalknowledge.in/api/auth/users`

## Troubleshooting

- Check backend logs: `sudo journalctl -u taskpad-backend -f`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check MySQL status: `sudo systemctl status mysql`
