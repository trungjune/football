import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedAdminUser() {
  console.log('🔐 Creating admin user...');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
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
    console.log('📧 Email: admin@football.com');
    console.log('🔑 Password: admin123');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Chạy seed nếu file được execute trực tiếp
if (require.main === module) {
  seedAdminUser()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
