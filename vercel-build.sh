#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Build the application
echo "📦 Building application..."
npm run build

# Setup database if DATABASE_URL exists
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️ DATABASE_URL found, setting up database..."
  
  cd backend
  
  # Run migrations
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy
  
  # Generate Prisma client
  echo "🔧 Generating Prisma client..."
  npx prisma generate
  
  # Seed admin user
  echo "👤 Seeding admin user..."
  npx tsx prisma/seed-admin.ts || echo "⚠️ Seed failed, user may already exist"
  
  cd ..
  
  echo "✅ Database setup completed!"
else
  echo "⚠️ DATABASE_URL not found, skipping database setup"
fi

echo "🎉 Build process completed!"
