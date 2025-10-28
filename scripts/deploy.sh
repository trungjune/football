#!/bin/bash

# Football Team Management - Deployment Script
# This script handles the deployment process to Vercel

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
    exit 1
fi

# Environment check
ENVIRONMENT=${1:-preview}
if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "preview" ]; then
    print_warning "Invalid environment. Using 'preview' as default."
    ENVIRONMENT="preview"
fi

print_status "Deploying to: $ENVIRONMENT"

# Pre-deployment checks
print_status "Running pre-deployment checks..."

# Check if required environment variables are set
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] && [ "$ENVIRONMENT" = "production" ]; then
        print_warning "Environment variable $var is not set"
    fi
done

# Build backend
print_status "Building backend..."
cd backend
npm run build
if [ $? -ne 0 ]; then
    print_error "Backend build failed"
    exit 1
fi
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed"
    exit 1
fi
cd ..

# Run tests
print_status "Running tests..."
cd backend
npm run test
if [ $? -ne 0 ]; then
    print_warning "Backend tests failed, but continuing deployment"
fi
cd ..

cd frontend
npm run test
if [ $? -ne 0 ]; then
    print_warning "Frontend tests failed, but continuing deployment"
fi
cd ..

# Deploy to Vercel
print_status "Deploying to Vercel..."

if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod --yes
else
    vercel --yes
fi

if [ $? -eq 0 ]; then
    print_status "✅ Deployment completed successfully!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}')
    print_status "🌐 Deployment URL: https://$DEPLOYMENT_URL"
    
    # Run post-deployment health check
    print_status "Running post-deployment health check..."
    sleep 10
    
    HEALTH_CHECK_URL="https://$DEPLOYMENT_URL/api/health"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        print_status "✅ Health check passed"
    else
        print_warning "⚠️  Health check failed (HTTP $HTTP_STATUS)"
    fi
    
else
    print_error "❌ Deployment failed"
    exit 1
fi

print_status "🎉 Deployment process completed!"