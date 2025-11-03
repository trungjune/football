const { PrismaClient } = require('@prisma/client');

async function checkAdmin() {
  const prisma = new PrismaClient();

  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@football.com' },
    });

    if (admin) {
      console.log('✅ Admin user exists:');
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Has password:', admin.password ? 'YES' : 'NO');
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
