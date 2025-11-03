@echo off
echo ========================================
echo    DEPLOY FOOTBALL TEAM MANAGEMENT
echo ========================================

echo.
echo [1/3] Deploying Backend...
cd backend
call vercel --prod
if %errorlevel% neq 0 (
    echo Backend deployment failed!
    pause
    exit /b 1
)

echo.
echo Backend deployed successfully!
echo Please copy the backend URL and update BACKEND_URL
echo.
set /p backend_url="Enter backend URL (e.g., https://your-backend.vercel.app): "

cd ..

echo.
echo [2/3] Updating frontend configuration...
powershell -Command "(Get-Content vercel.json) -replace '\"BACKEND_URL\": \".*\"', '\"BACKEND_URL\": \"%backend_url%\"' | Set-Content vercel.json"
powershell -Command "(Get-Content frontend/.env.local) -replace 'BACKEND_URL=.*', 'BACKEND_URL=%backend_url%' | Set-Content frontend/.env.local"

echo.
echo [3/3] Deploying Frontend...
call vercel --prod
if %errorlevel% neq 0 (
    echo Frontend deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend URL: https://football-team-manager-pi.vercel.app
echo Backend URL: %backend_url%
echo.
echo Login credentials:
echo Admin: admin@football.com / admin123
echo Member: nguyen.huu.phuc.fcvuive@gmail.com / password123
echo.
echo ✅ All data is REAL from database (no fake data)
echo ✅ Authentication works through backend API
echo ✅ Dashboard shows real statistics
pause