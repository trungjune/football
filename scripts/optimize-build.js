#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build optimization...');

// Frontend optimizations
console.log('📦 Optimizing frontend build...');

// Check if we should enable bundle analyzer
if (process.env.ANALYZE === 'true') {
  console.log('📊 Bundle analyzer enabled');
}

// Backend optimizations
console.log('⚙️ Optimizing backend build...');

// Ensure Prisma client is generated
const { execSync } = require('child_process');

try {
  console.log('🔧 Generating Prisma client...');
  execSync('cd backend && npx prisma generate', { stdio: 'inherit' });

  console.log('🏗️ Building backend...');
  execSync('cd backend && npm run build', { stdio: 'inherit' });

  console.log('🎨 Building frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });

  console.log('✅ Build optimization complete!');
} catch (error) {
  console.error('❌ Build optimization failed:', error.message);
  process.exit(1);
}

// Performance recommendations
console.log('\n📋 Performance Recommendations:');
console.log('• Enable Redis caching with Upstash for production');
console.log('• Configure CDN for static assets');
console.log('• Set up database connection pooling');
console.log('• Enable gzip compression');
console.log('• Monitor Core Web Vitals');
console.log('• Use ISR for frequently accessed pages');

console.log('\n🎯 Deployment checklist:');
console.log('• Set environment variables in Vercel');
console.log('• Configure custom domain');
console.log('• Set up monitoring and alerts');
console.log('• Test PWA installation');
console.log('• Verify mobile responsiveness');
