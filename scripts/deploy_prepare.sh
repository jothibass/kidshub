#!/usr/bin/env bash
set -e
sudo apt update && sudo apt install -y nodejs npm unzip git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
mkdir -p "$1"
chown $(whoami):$(whoami) "$1"
npm install -g pm2
