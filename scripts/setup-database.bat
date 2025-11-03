@echo off
echo ========================================
echo    SETUP DATABASE FOR DEPLOYMENT
echo ========================================

echo.
echo [1/3] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo [3/3] Seeding database...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo Failed to seed database!
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo    DATABASE SETUP COMPLETED!
echo ========================================
echo.
echo Admin credentials:
echo Email: admin@football.com
echo Password: admin123
echo.
echo Member credentials (example):
echo Email: nguyen.huu.phuc.fcvuive@gmail.com
echo Password: password123
echo.
echo Database is ready for deployment!
pause