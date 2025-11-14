const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Seeding production database...');

try {
  // Change to backend directory
  const backendDir = path.join(__dirname, '..', 'backend');
  process.chdir(backendDir);
  
  console.log('📂 Working directory:', process.cwd());
  
  // Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Seed admin user
  console.log('👤 Seeding admin user...');
  execSync('node -r ts-node/register prisma/seed-admin.ts', { stdio: 'inherit' });
  
  console.log('✅ Production database seeded successfully!');
  console.log('📧 Admin login: admin@football.com');
  console.log('🔑 Password: admin123');
  
} catch (error) {
  console.error('❌ Error seeding production database:', error.message);
  process.exit(1);
}
