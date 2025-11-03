import { PrismaClient } from '@prisma/client';
import { seedFinanceData } from './seed-finance';
import { seedAdminUser } from './seed-admin';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed admin user first
    await seedAdminUser();

    // Seed finance data (includes teams, members, fees, payments)
    await seedFinanceData();

    console.log('🎉 Database seeding completed successfully!');
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
