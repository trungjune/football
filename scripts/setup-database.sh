#!/bin/bash

echo "========================================"
echo "   SETUP DATABASE FOR DEPLOYMENT"
echo "========================================"

echo ""
echo "[1/3] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies!"
    exit 1
fi

echo ""
echo "[2/3] Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "Failed to generate Prisma client!"
    exit 1
fi

echo ""
echo "[3/3] Seeding database..."
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "Failed to seed database!"
    exit 1
fi

cd ..

echo ""
echo "========================================"
echo "   DATABASE SETUP COMPLETED!"
echo "========================================"
echo ""
echo "Admin credentials:"
echo "Email: admin@football.com"
echo "Password: admin123"
echo ""
echo "Member credentials (example):"
echo "Email: nguyen.huu.phuc.fcvuive@gmail.com"
echo "Password: password123"
echo ""
echo "Database is ready for deployment!"