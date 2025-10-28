#!/bin/bash

echo "🚀 Setting up Football Team Management project..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

cd ..

# Build shared package
echo "🔧 Building shared package..."
cd shared
npm install
npm run build
cd ..

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Run 'cd backend && npx prisma migrate dev' to setup database"
echo "4. Run 'cd backend && npx prisma db seed' to seed sample data"