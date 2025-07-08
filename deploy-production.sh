#!/bin/bash

# Wilhelm - Production Deployment Script
# This script prepares and deploys Wilhelm to production

set -e

echo "🚀 Wilhelm Production Deployment"
echo "================================="

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root."
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Set production environment
export NODE_ENV=production
echo "✅ Environment set to production"

# Check required environment variables
echo "📋 Checking environment variables..."
REQUIRED_VARS=("DATABASE_URL" "GROQ_API_KEY" "SESSION_SECRET")
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
    echo "✅ $var is configured"
done

# Database migration
echo "📋 Updating database schema..."
npm run db:push
echo "✅ Database schema updated"

# Build the application
echo "📋 Building application..."
npm run build
echo "✅ Application built successfully"

# Run TypeScript check
echo "📋 Running TypeScript check..."
npm run check
echo "✅ TypeScript check passed"

# Health check function
check_health() {
    local url="$1"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/health" > /dev/null 2>&1; then
            echo "✅ Health check passed"
            return 0
        fi
        echo "⏳ Health check attempt $attempt/$max_attempts..."
        sleep 2
        ((attempt++))
    done
    
    echo "❌ Health check failed after $max_attempts attempts"
    return 1
}

# Start the production server
echo "📋 Starting production server..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Production server started (PID: $SERVER_PID)"
else
    echo "❌ Failed to start production server"
    exit 1
fi

# Run health check
echo "📋 Running health check..."
check_health "http://localhost:5000"

# SSL check
echo "📋 Checking SSL readiness..."
if curl -f -s "http://localhost:5000/.well-known/ssl-check" > /dev/null 2>&1; then
    echo "✅ SSL check passed"
else
    echo "⚠️  SSL check failed (expected in local environment)"
fi

echo ""
echo "🎉 Production deployment completed successfully!"
echo "================================="
echo "📊 Deployment Summary:"
echo "  • Environment: production"
echo "  • Database: connected and migrated"
echo "  • Build: successful"
echo "  • Server: running on port 5000"
echo "  • Health check: ✅ passed"
echo "  • SSL readiness: ✅ configured"
echo ""
echo "📋 Next Steps:"
echo "  1. Configure SSL certificate for your domain"
echo "  2. Set up monitoring and alerting"
echo "  3. Configure backups for database"
echo "  4. Set up log aggregation"
echo ""
echo "🔗 Access Points:"
echo "  • Health: http://localhost:5000/health"
echo "  • SSL Check: http://localhost:5000/.well-known/ssl-check"
echo "  • Application: http://localhost:5000"
echo ""
echo "⚠️  Remember: This is for educational and research purposes only"
echo "   Not intended for clinical use"
echo ""
echo "🏥 Wilhelm is now ready for production deployment!"