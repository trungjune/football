import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@test.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    // Create member profile for admin
    await prisma.member.create({
      data: {
        userId: adminUser.id,
        fullName: 'Administrator',
        position: 'MIDFIELDER',
        memberType: 'OFFICIAL',
        status: 'ACTIVE',
      },
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@test.com');
    console.log('Password: admin');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
