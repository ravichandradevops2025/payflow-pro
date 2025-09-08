
#!/bin/bash

set -e

echo "Ì¥Ñ Updating PayFlow Pro Production..."

# Create backup before update
echo "Ì≤æ Creating backup before update..."
./scripts/backup.sh

# Pull latest code
if [ -d ".git" ]; then
   echo "Ì≥• Pulling latest code..."
   git pull origin main
fi

# Rebuild and update services
echo "Ì≥¶ Rebuilding services..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Ì¥Ñ Updating services with zero downtime..."
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend

# Wait for services to be ready
echo "‚è≥ Waiting for services to restart..."
sleep 30

# Check health
echo "Ì¥ç Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "‚úÖ Production update completed!"
