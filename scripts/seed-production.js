const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Seeding production database...');

try {
  // Change to backend directory
  const backendDir = path.join(__dirname, '..', 'backend');
  process.chdir(backendDir);
  
  console.log('📂 Working directory:', process.cwd());
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in Vercel environment variables.');
    process.exit(1);
  }
  
  console.log('🔗 Database URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');
  
  // Run database migrations
  console.log('🔄 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Seed admin user
  console.log('👤 Seeding admin user...');
  execSync('npx tsx prisma/seed-admin.ts', { stdio: 'inherit' });
  
  console.log('✅ Production database seeded successfully!');
  console.log('📧 Admin login: admin@football.com');
  console.log('🔑 Password: admin123');
  
} catch (error) {
  console.error('❌ Error seeding production database:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check DATABASE_URL is set in Vercel env vars');
  console.log('2. Ensure database is accessible');
  console.log('3. Run: vercel env pull .env.local');
  process.exit(1);
}
