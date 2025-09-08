
#!/bin/bash

set -e

echo "� Updating PayFlow Pro Production..."

# Create backup before update
echo "� Creating backup before update..."
./scripts/backup.sh

# Pull latest code
if [ -d ".git" ]; then
   echo "� Pulling latest code..."
   git pull origin main
fi

# Rebuild and update services
echo "� Rebuilding services..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "� Updating services with zero downtime..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# Wait for services to be ready
echo "⏳ Waiting for services to restart..."
sleep 30

# Check health
echo "� Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Production update completed!"
