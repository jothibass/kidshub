#!/usr/bin/env bash
set -euo pipefail

WEB_ROOT=/var/www/kidshub
BACKEND_SRC=/home/ec2-user/deploy/backend
FRONTEND_SRC=/home/ec2-user/deploy/frontend

# 1. copy backend
sudo mkdir -p ${WEB_ROOT}/backend
sudo rsync -a --delete ${BACKEND_SRC}/ ${WEB_ROOT}/backend/
sudo chown -R ec2-user:ec2-user ${WEB_ROOT}/backend

# 2. install deps
cd ${WEB_ROOT}/backend
if [ -f package-lock.json ]; then
  npm ci --silent
else
  npm install --silent
fi

# 3. run migrations (requires docker/psql or psql binary). Attempt using docker postgres image if available.
if [ -f /home/ec2-user/deploy/migrations/001_init.sql ]; then
  echo "Running migrations..."
  if command -v docker >/dev/null 2>&1; then
    sudo docker run --rm -v /home/ec2-user/deploy/migrations:/work -e PGPASSWORD="${RDS_MASTER_PASS:-}" postgres:15 bash -lc "psql 'host=${RDS_ENDPOINT} user=${RDS_MASTER_USER} dbname=${DB_NAME} sslmode=require' -f /work/001_init.sql"
  else
    echo "Docker not available; skipping migration step. Please run migrations manually."
  fi
fi

# 4. copy frontend dist (if provided)
if [ -d /home/ec2-user/deploy/frontend/dist ]; then
  sudo mkdir -p ${WEB_ROOT}/frontend
  sudo rm -rf ${WEB_ROOT}/frontend/dist || true
  sudo mv /home/ec2-user/deploy/frontend/dist ${WEB_ROOT}/frontend/dist
  sudo chown -R ec2-user:ec2-user ${WEB_ROOT}/frontend
fi

# 5. copy nginx config
sudo mkdir -p /etc/nginx/conf.d
sudo cp /home/ec2-user/deploy/nginx/kidshub.conf /etc/nginx/conf.d/kidshub.conf
sudo nginx -t && sudo systemctl reload nginx

# 6. pm2 start/restart
if pm2 list | grep -q kidshub; then
  pm2 restart kidshub --update-env || true
else
  cd ${WEB_ROOT}/backend
  pm2 start server.js --name kidshub
fi
pm2 save

echo "Deploy completed."
