const { PrismaClient } = require('@prisma/client');

async function createDefaultTeam() {
  const prisma = new PrismaClient();

  try {
    // Check if team exists
    let team = await prisma.team.findFirst({
      where: { name: 'FC Vui Vẻ' },
    });

    if (!team) {
      // Create default team
      team = await prisma.team.create({
        data: {
          id: 'team-1',
          name: 'FC Vui Vẻ',
          description: 'Đội bóng FC Vui Vẻ - Đội bóng chính',
        },
      });
      console.log('✅ Created default team:', team.name);
    } else {
      console.log('✅ Default team already exists:', team.name);
    }

    // Check members
    const memberCount = await prisma.member.count();
    console.log(`📊 Total members: ${memberCount}`);

    // Check sessions
    const sessionCount = await prisma.trainingSession.count();
    console.log(`📊 Total sessions: ${sessionCount}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultTeam();
