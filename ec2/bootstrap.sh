#!/bin/bash
set -e
sudo yum update -y
sudo yum install -y git nginx
# install nvm + node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
npm install -g pm2
sudo mkdir -p /var/www/kidshub
sudo chown ec2-user:ec2-user /var/www/kidshub
# nginx site
sudo tee /etc/nginx/conf.d/kidshub.conf > /dev/null <<'NGINXCONF'
server {
    listen 80;
    server_name _;
    root /var/www/kidshub/dist;
    index index.html;
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    location / { try_files $uri $uri/ /index.html; }
}
NGINXCONF
sudo systemctl enable nginx
sudo systemctl start nginx
echo "Bootstrap complete"
