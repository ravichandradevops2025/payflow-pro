
#!/bin/bash

echo "Ì≥ä PayFlow Pro System Monitor"
echo "=============================="

# Check Docker services
echo ""
echo "Ì∞≥ Docker Services Status:"
docker-compose ps

# Check system resources
echo ""
echo "Ì≤ª System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "Disk Usage: $(df -h | awk '$NF=="/"{printf "%s", $5}')"

# Check application health
echo ""
echo "Ìø• Application Health:"
echo -n "Backend API: "
if curl -s http://localhost:3000/health > /dev/null; then
   echo "‚úÖ Healthy"
else
   echo "‚ùå Unhealthy"
fi

echo -n "Frontend: "
if curl -s http://localhost > /dev/null; then
   echo "‚úÖ Healthy"
else
   echo "‚ùå Unhealthy"
fi

echo -n "Database: "
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
   echo "‚úÖ Healthy"
else
   echo "‚ùå Unhealthy"
fi

echo -n "Redis: "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
   echo "‚úÖ Healthy"
else
   echo "‚ùå Unhealthy"
fi

# Show recent logs
echo ""
echo "Ì≥ù Recent Logs (last 10 lines):"
echo "Backend:"
docker-compose logs --tail=5 backend

echo "Frontend:"
docker-compose logs --tail=5 frontend
