#!/bin/bash
set -e
cd /home/fayanzar/knowledge-hub
git pull origin main

# backend
cd packages/server
npm ci
npx prisma migrate deploy
npx prisma generate
pm2 restart ecosystem.config.cjs

# frontend
cd ../client
npm install
npm run build
rsync -a --delete dist/ /home/fayanzar/public_html/hub.fayanzar.art/
