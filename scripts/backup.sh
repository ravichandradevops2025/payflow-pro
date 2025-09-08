
#!/bin/bash

set -e

# Load environment variables
if [ -f ".env.production" ]; then
   source .env.production
else
   echo "âŒ .env.production not found, using defaults"
   DB_NAME="payflow_pro"
   DB_USER="postgres"
fi

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="payflow_backup_$DATE.sql"

echo "í²¾ Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
docker-compose exec -T postgres pg_dump -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
gzip "$BACKUP_DIR/$BACKUP_FILE"

echo "âœ… Backup created: $BACKUP_DIR/$BACKUP_FILE.gz"

# Keep only last 7 backups
echo "í·¹ Cleaning old backups..."
cd $BACKUP_DIR
ls -t payflow_backup_*.sql.gz | tail -n +8 | xargs -r rm --

echo "âœ… Backup process completed!"
