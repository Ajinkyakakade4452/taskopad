#!/bin/bash

# Edigital TaskPad Deployment Script
# For Ubuntu/Debian VPS

set -e

echo "=========================================="
echo "  Edigital TaskPad Deployment Script"
echo "=========================================="

# Configuration
PROJECT_DIR="/var/www/tasktracker"
BACKEND_JAR="backend/target/taskpad-0.0.1-SNAPSHOT.jar"
SERVICE_NAME="taskpad-backend"

# Step 1: Update system packages
echo ""
echo "Step 1: Updating system packages..."
sudo apt update -y

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
sudo apt install -y nginx openjdk-17-jdk maven nodejs npm mysql-server

# Step 3: Create project directory
echo ""
echo "Step 3: Setting up project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# Step 4: Build frontend
echo ""
echo "Step 4: Building frontend..."
npm install
npm run build
sudo cp -r dist/* $PROJECT_DIR/dist/

# Step 5: Build backend
echo ""
echo "Step 5: Building backend..."
cd backend
mvn clean package -DskipTests
cd ..

# Step 6: Setup systemd service for backend
echo ""
echo "Step 6: Setting up backend service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null << EOF
[Unit]
Description=Edigital TaskPad Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/bin/java -jar $PROJECT_DIR/$(basename $BACKEND_JAR) --spring.profiles.active=prod
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo cp $BACKEND_JAR $PROJECT_DIR/

# Step 7: Setup Nginx
echo ""
echo "Step 7: Setting up Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/tasktracker
sudo ln -sf /etc/nginx/sites-available/tasktracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Step 8: Start services
echo ""
echo "Step 8: Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME
sudo systemctl enable nginx
sudo systemctl start nginx

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo "Your application is now running at http://tasktracker.edigitalknowledge.in"
echo "Don't forget to:"
echo "1. Configure your MySQL database"
echo "2. Update application-prod.properties with your DB credentials"
echo "3. Set up SSL with Let's Encrypt (certbot)"
