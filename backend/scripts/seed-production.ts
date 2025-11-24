import { PrismaClient } from '@prisma/client';
import { seedFinanceData } from '../prisma/seed-finance';
import { seedAdminUser } from '../prisma/seed-admin';

// Force sử dụng Supabase URL
const DATABASE_URL = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!DATABASE_URL || !DATABASE_URL.includes('supabase')) {
  console.error('❌ DATABASE_URL không phải Supabase!');
  console.error('Current URL:', DATABASE_URL);
  process.exit(1);
}

console.log('🔗 Connecting to Supabase database...');
console.log('URL:', DATABASE_URL.substring(0, 50) + '...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Starting PRODUCTION database seeding...');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check current data
    const memberCount = await prisma.member.count();
    const feeCount = await prisma.fee.count();
    const paymentCount = await prisma.payment.count();

    console.log('📊 Current data:');
    console.log(`   - Members: ${memberCount}`);
    console.log(`   - Fees: ${feeCount}`);
    console.log(`   - Payments: ${paymentCount}`);

    if (memberCount > 0) {
      console.log('⚠️  Database already has data. Do you want to continue? (This will add more data)');
      // For now, we'll skip if data exists
      console.log('Skipping seed to avoid duplicates.');
      return;
    }

    // Seed admin user first
    await seedAdminUser();

    // Seed finance data (includes teams, members, fees, payments)
    await seedFinanceData();

    console.log('🎉 PRODUCTION database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
