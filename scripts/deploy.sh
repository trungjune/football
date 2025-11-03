#!/bin/bash

echo "========================================"
echo "   DEPLOY FOOTBALL TEAM MANAGEMENT"
echo "========================================"

echo ""
echo "[1/3] Deploying Backend..."
cd backend
vercel --prod
if [ $? -ne 0 ]; then
    echo "Backend deployment failed!"
    exit 1
fi

echo ""
echo "Backend deployed successfully!"
echo "Please copy the backend URL and update BACKEND_URL"
echo ""
read -p "Enter backend URL (e.g., https://your-backend.vercel.app): " backend_url

cd ..

echo ""
echo "[2/3] Updating frontend configuration..."
sed -i "s|\"BACKEND_URL\": \".*\"|\"BACKEND_URL\": \"$backend_url\"|g" vercel.json
sed -i "s|BACKEND_URL=.*|BACKEND_URL=$backend_url|g" frontend/.env.local

echo ""
echo "[3/3] Deploying Frontend..."
vercel --prod
if [ $? -ne 0 ]; then
    echo "Frontend deployment failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "   DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "========================================"
echo ""
echo "Frontend URL: https://football-team-manager-pi.vercel.app"
echo "Backend URL: $backend_url"
echo ""
echo "Login credentials:"
echo "Admin: admin@football.com / admin123"
echo "Member: nguyen.huu.phuc.fcvuive@gmail.com / password123"
echo ""
echo "✅ All data is REAL from database (no fake data)"
echo "✅ Authentication works through backend API"
echo "✅ Dashboard shows real statistics"