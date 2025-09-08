
#!/bin/bash

echo "� PayFlow Pro System Monitor"
echo "=============================="

# Check Docker services
echo ""
echo "� Docker Services Status:"
docker-compose ps

# Check system resources
echo ""
echo "� System Resources:"
echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "Disk Usage: $(df -h | awk '$NF=="/"{printf "%s", $5}')"

# Check application health
echo ""
echo "� Application Health:"
echo -n "Backend API: "
if curl -s http://localhost:3000/health > /dev/null; then
   echo "✅ Healthy"
else
   echo "❌ Unhealthy"
fi

echo -n "Frontend: "
if curl -s http://localhost > /dev/null; then
   echo "✅ Healthy"
else
   echo "❌ Unhealthy"
fi

echo -n "Database: "
if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
   echo "✅ Healthy"
else
   echo "❌ Unhealthy"
fi

echo -n "Redis: "
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
   echo "✅ Healthy"
else
   echo "❌ Unhealthy"
fi

# Show recent logs
echo ""
echo "� Recent Logs (last 10 lines):"
echo "Backend:"
docker-compose logs --tail=5 backend

echo "Frontend:"
docker-compose logs --tail=5 frontend
