import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!DATABASE_URL || !DATABASE_URL.includes('supabase')) {
  console.error('❌ DATABASE_URL không phải Supabase!');
  console.error('Current URL:', DATABASE_URL);
  process.exit(1);
}

console.log('🔗 Connecting to Supabase database...');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🗑️  Clearing PRODUCTION database...');
  console.log('⚠️  This will delete ALL data!');

  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Delete in correct order (respecting foreign keys)
    console.log('Deleting payments...');
    await prisma.payment.deleteMany();

    console.log('Deleting fees...');
    await prisma.fee.deleteMany();

    console.log('Deleting registrations...');
    await prisma.registration.deleteMany();

    console.log('Deleting attendances...');
    await prisma.attendance.deleteMany();

    console.log('Deleting training sessions...');
    await prisma.trainingSession.deleteMany();

    console.log('Deleting team members...');
    await prisma.teamMember.deleteMany();

    console.log('Deleting members...');
    await prisma.member.deleteMany();

    console.log('Deleting teams...');
    await prisma.team.deleteMany();

    console.log('Deleting accounts...');
    await prisma.account.deleteMany();

    console.log('Deleting sessions...');
    await prisma.session.deleteMany();

    console.log('Deleting users...');
    await prisma.user.deleteMany();

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
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
