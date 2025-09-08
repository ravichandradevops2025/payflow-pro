
#!/bin/bash

echo "Ì∫Ä Starting PayFlow Pro Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "‚ùå Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
mkdir -p logs backups uploads

# Build and start services
echo "Ì≥¶ Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "‚è≥ Waiting for services to start..."
sleep 30

# Check service health
echo "Ì¥ç Checking service health..."
docker-compose ps

# Show URLs
echo ""
echo "‚úÖ PayFlow Pro is running!"
echo "Ìºê Frontend: http://localhost"
echo "Ì¥ß Backend API: http://localhost:3000"
echo "Ì∑ÑÔ∏è Database: localhost:5432"
echo "Ì¥¥ Redis: localhost:6379"
echo ""
echo "Ì≥ã Default login credentials:"
echo "   Admin: admin@payflow.com / password123"
echo "   HR: hr@payflow.com / password123"
echo "   Payroll: payroll@payflow.com / password123"
echo ""
echo "To stop: ./scripts/dev-stop.sh"
echo "To view logs: docker-compose logs -f [service-name]"
