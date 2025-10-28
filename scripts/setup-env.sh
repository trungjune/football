#!/bin/bash

# Environment Setup Script for Football Team Management
# This script helps set up environment variables for deployment

set -e

echo "🔧 Setting up environment variables for deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it with: npm i -g vercel"
    exit 1
fi

print_status "Setting up environment variables for Vercel deployment..."

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local is_secret=${3:-false}
    
    print_info "Setting up $var_name - $var_description"
    
    if [ "$is_secret" = true ]; then
        read -s -p "Enter value for $var_name: " var_value
        echo
    else
        read -p "Enter value for $var_name: " var_value
    fi
    
    if [ -n "$var_value" ]; then
        vercel env add "$var_name" production <<< "$var_value"
        vercel env add "$var_name" preview <<< "$var_value"
        print_status "✅ $var_name set successfully"
    else
        print_warning "⚠️  Skipped $var_name (empty value)"
    fi
    
    echo
}

# Database Configuration
print_info "=== Database Configuration ==="
set_env_var "DATABASE_URL" "PostgreSQL connection string (from Neon)" true

# JWT Configuration
print_info "=== Authentication Configuration ==="
set_env_var "JWT_SECRET" "JWT secret key for authentication" true

# Encryption Configuration
print_info "=== Data Protection Configuration ==="
print_info "Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "Generated encryption key: $ENCRYPTION_KEY"
vercel env add "ENCRYPTION_KEY" production <<< "$ENCRYPTION_KEY"
vercel env add "ENCRYPTION_KEY" preview <<< "$ENCRYPTION_KEY"
print_status "✅ ENCRYPTION_KEY set successfully"
echo

# Cloudinary Configuration
print_info "=== File Upload Configuration (Cloudinary) ==="
set_env_var "CLOUDINARY_CLOUD_NAME" "Cloudinary cloud name"
set_env_var "CLOUDINARY_API_KEY" "Cloudinary API key"
set_env_var "CLOUDINARY_API_SECRET" "Cloudinary API secret" true

# Redis Configuration (Optional)
print_info "=== Caching Configuration (Optional) ==="
read -p "Do you want to set up Redis for caching? (y/n): " setup_redis
if [ "$setup_redis" = "y" ] || [ "$setup_redis" = "Y" ]; then
    set_env_var "REDIS_URL" "Redis connection string (from Upstash)" true
fi

# Sentry Configuration (Optional)
print_info "=== Error Tracking Configuration (Optional) ==="
read -p "Do you want to set up Sentry for error tracking? (y/n): " setup_sentry
if [ "$setup_sentry" = "y" ] || [ "$setup_sentry" = "Y" ]; then
    set_env_var "SENTRY_DSN" "Sentry DSN for error tracking" true
fi

# Email Configuration (Optional)
print_info "=== Email Configuration (Optional) ==="
read -p "Do you want to set up email notifications? (y/n): " setup_email
if [ "$setup_email" = "y" ] || [ "$setup_email" = "Y" ]; then
    set_env_var "SMTP_HOST" "SMTP server host"
    set_env_var "SMTP_PORT" "SMTP server port (usually 587)"
    set_env_var "SMTP_USER" "SMTP username"
    set_env_var "SMTP_PASS" "SMTP password" true
    set_env_var "FROM_EMAIL" "From email address"
fi

# Security Configuration
print_info "=== Security Configuration ==="
vercel env add "RATE_LIMIT_WINDOW_MS" production <<< "60000"
vercel env add "RATE_LIMIT_MAX" production <<< "100"
vercel env add "MAX_FILE_SIZE" production <<< "5242880"
vercel env add "PASSWORD_MIN_LENGTH" production <<< "8"
vercel env add "AUDIT_LOGGING_ENABLED" production <<< "true"

vercel env add "RATE_LIMIT_WINDOW_MS" preview <<< "60000"
vercel env add "RATE_LIMIT_MAX" preview <<< "100"
vercel env add "MAX_FILE_SIZE" preview <<< "5242880"
vercel env add "PASSWORD_MIN_LENGTH" preview <<< "8"
vercel env add "AUDIT_LOGGING_ENABLED" preview <<< "true"

print_status "✅ Security configuration set successfully"

print_status "🎉 Environment setup completed!"
print_info "You can now run the deployment script: ./scripts/deploy.sh"
print_info "To view all environment variables: vercel env ls"