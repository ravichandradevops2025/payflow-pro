
#!/bin/bash

set -e

echo "Ì∫Ä Deploying PayFlow Pro to Production..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "‚ùå .env.production file not found. Please create it first."
    exit 1
fi

# Load production environment variables
source .env.production

# Create necessary directories
mkdir -p logs backups uploads ssl

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo "Ì≥• Pulling latest code..."
    git pull origin main
fi

# Build and deploy
echo "Ì≥¶ Building production images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "Ì∫Ä Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "‚è≥ Waiting for services to start..."
sleep 60

# Run database migrations (if needed)
echo "Ì¥Ñ Running database setup..."
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U $DB_USER -d $DB_NAME -f /docker-entrypoint-initdb.d/01-init.sql

# Check service health
echo "Ì¥ç Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Create backup
echo "Ì≤æ Creating initial backup..."
./scripts/backup.sh

echo ""
echo "‚úÖ PayFlow Pro Production Deployment Complete!"
echo "Ìºê Application URL: https://your-domain.com"
echo "Ì¥ß API URL: https://your-domain.com/api/v1"
echo ""
echo "Ì≥ä To monitor: docker-compose -f docker-compose.prod.yml logs -f"
echo "Ì¥Ñ To update: ./scripts/prod-update.sh"
echo "Ì≤æ To backup: ./scripts/backup.sh"
