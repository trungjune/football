@echo off
echo 🚀 Setting up Football Team Management project...

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
call npx prisma generate

cd ..

REM Build shared package
echo 🔧 Building shared package...
cd shared
call npm install
call npm run build
cd ..

echo ✅ Setup complete!
echo.
echo 🔧 Next steps:
echo 1. Copy .env.example to .env and configure your environment variables
echo 2. Run 'npm run dev' to start development servers
echo 3. Run 'cd backend && npx prisma migrate dev' to setup database
echo 4. Run 'cd backend && npx prisma db seed' to seed sample data

pause