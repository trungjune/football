const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('📋 All users in database:');
    users.forEach((user, index) => {
      console.log(
        `${index + 1}. ${user.email} (${user.role}) - Created: ${user.createdAt.toLocaleDateString()}`,
      );
    });

    console.log(`\n📊 Total users: ${users.length}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
