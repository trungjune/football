const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...');

  try {
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@football.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@football.com',
        password: hashedPassword,
        phone: '0123456789',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created:', adminUser.email);

    // 2. Create sample team
    console.log('⚽ Creating sample team...');
    const team = await prisma.team.upsert({
      where: { id: 'fc-vui-ve' },
      update: {},
      create: {
        id: 'fc-vui-ve',
        name: 'FC Vui Vẻ',
        description: 'Đội bóng sân 7 FC Vui Vẻ',
      },
    });

    console.log('✅ Team created:', team.name);

    // 3. Create sample member
    console.log('👥 Creating sample member...');
    const memberPassword = await bcrypt.hash('password123', 10);

    const memberUser = await prisma.user.upsert({
      where: { email: 'nguyen.huu.phuc.fcvuive@gmail.com' },
      update: {
        password: memberPassword,
      },
      create: {
        email: 'nguyen.huu.phuc.fcvuive@gmail.com',
        password: memberPassword,
        phone: '0969240487',
        role: 'MEMBER',
      },
    });

    const member = await prisma.member.upsert({
      where: { userId: memberUser.id },
      update: {},
      create: {
        userId: memberUser.id,
        fullName: 'Nguyễn Hữu Phúc',
        dateOfBirth: new Date(1987, 0, 1),
        position: 'MIDFIELDER',
        memberType: 'OFFICIAL',
        status: 'ACTIVE',
      },
    });

    console.log('✅ Sample member created:', member.fullName);

    console.log('🎉 Production database setup completed!');
    console.log('');
    console.log('Login credentials:');
    console.log('Admin: admin@football.com / admin123');
    console.log('Member: nguyen.huu.phuc.fcvuive@gmail.com / password123');
  } catch (error) {
    console.error('❌ Error setting up production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionDatabase();
