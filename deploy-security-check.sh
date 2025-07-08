#!/bin/bash

# Security Check Script for Wilhelm Production Deployment
# This script verifies all security configurations are properly set

echo "🔒 Wilhelm Security Configuration Check"
echo "======================================="

# Check if running in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo "⚠️  WARNING: Not running in production mode!"
    echo "   Set NODE_ENV=production for security features to activate"
fi

# Function to check security headers
check_security_headers() {
    local url="$1"
    echo ""
    echo "📋 Checking security headers for: $url"
    
    # Make request and capture headers
    headers=$(curl -s -I "$url" 2>/dev/null)
    
    # Check for critical security headers
    if echo "$headers" | grep -qi "Strict-Transport-Security"; then
        echo "✅ HSTS header present"
    else
        echo "❌ HSTS header missing!"
    fi
    
    if echo "$headers" | grep -qi "Content-Security-Policy"; then
        echo "✅ CSP header present"
    else
        echo "❌ CSP header missing!"
    fi
    
    if echo "$headers" | grep -qi "X-Frame-Options"; then
        echo "✅ X-Frame-Options header present"
    else
        echo "❌ X-Frame-Options header missing!"
    fi
    
    if echo "$headers" | grep -qi "X-Content-Type-Options"; then
        echo "✅ X-Content-Type-Options header present"
    else
        echo "❌ X-Content-Type-Options header missing!"
    fi
    
    if echo "$headers" | grep -qi "X-XSS-Protection"; then
        echo "✅ X-XSS-Protection header present"
    else
        echo "❌ X-XSS-Protection header missing!"
    fi
    
    # Check for headers that should NOT be present
    if echo "$headers" | grep -qi "X-Powered-By"; then
        echo "❌ X-Powered-By header present (should be removed)!"
    else
        echo "✅ X-Powered-By header removed"
    fi
    
    if echo "$headers" | grep -qi "Server:"; then
        echo "⚠️  Server header present (consider removing)"
    else
        echo "✅ Server header removed"
    fi
}

# Function to check SSL configuration
check_ssl_config() {
    local url="$1/.well-known/ssl-check"
    echo ""
    echo "🔐 Checking SSL configuration..."
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL check endpoint accessible"
        
        # Parse JSON response (basic check)
        if echo "$response" | grep -q '"ssl_ready":true'; then
            echo "✅ SSL ready status: true"
        else
            echo "❌ SSL ready status: false"
        fi
        
        if echo "$response" | grep -q '"secure_connection":true'; then
            echo "✅ Secure connection detected"
        else
            echo "❌ Secure connection not detected"
        fi
    else
        echo "❌ SSL check endpoint not accessible"
    fi
}

# Function to check security test endpoint
check_security_test() {
    local url="$1/.well-known/security-test"
    echo ""
    echo "🛡️  Checking comprehensive security test..."
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ Security test endpoint accessible"
        
        if echo "$response" | grep -q '"status":"secure"'; then
            echo "✅ Security status: secure"
        else
            echo "❌ Security status: not secure"
        fi
    else
        echo "❌ Security test endpoint not accessible"
    fi
}

# Main checks
BASE_URL="${1:-http://localhost:5000}"

echo "🌐 Testing URL: $BASE_URL"
echo ""

# Check main page
check_security_headers "$BASE_URL"

# Check SSL configuration
check_ssl_config "$BASE_URL"

# Check security test
check_security_test "$BASE_URL"

# Additional checks
echo ""
echo "📊 Additional Security Recommendations:"
echo "1. Ensure GROQ_API_KEY is set in environment"
echo "2. Ensure SESSION_SECRET is a strong random value"
echo "3. Ensure DATABASE_URL uses SSL connection"
echo "4. Configure custom domain with SSL certificate"
echo "5. Enable Replit's built-in SSL/TLS support"
echo ""
echo "🔗 To test production security:"
echo "   NODE_ENV=production npm start"
echo "   Then run: ./deploy-security-check.sh https://wilhelm.replit.app"
echo ""
echo "✅ Security check complete!"