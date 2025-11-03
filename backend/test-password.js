const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testPassword() {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@football.com' },
    });

    if (user && user.password) {
      console.log('Testing passwords...');

      const passwords = ['admin123', 'password123', '123456', 'admin'];

      for (const pwd of passwords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        console.log(`Password "${pwd}": ${isValid ? '✅ CORRECT' : '❌ Wrong'}`);
      }
    } else {
      console.log('❌ User not found or no password');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
