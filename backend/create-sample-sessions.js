const { PrismaClient } = require('@prisma/client');

async function createSampleSessions() {
  const prisma = new PrismaClient();

  try {
    // Get team
    const team = await prisma.team.findFirst({
      where: { name: 'FC Vui Vẻ' },
    });

    if (!team) {
      console.log('❌ No team found');
      return;
    }

    // Check if sessions exist
    const existingSessions = await prisma.trainingSession.count({
      where: { teamId: team.id },
    });

    if (existingSessions > 0) {
      console.log(`✅ Already have ${existingSessions} sessions`);
      return;
    }

    // Create sample sessions
    const sessions = [
      {
        teamId: team.id,
        title: 'Tập luyện kỹ thuật cơ bản',
        description: 'Luyện tập kỹ thuật chuyền bóng, dẫn bóng và sút bóng',
        datetime: new Date('2025-11-05T19:00:00Z'),
        location: 'Sân bóng Thống Nhất',
        type: 'TRAINING',
        maxParticipants: 20,
        registrationDeadline: new Date('2025-11-05T12:00:00Z'),
      },
      {
        teamId: team.id,
        title: 'Tập luyện thể lực',
        description: 'Tăng cường thể lực và sức bền cho các cầu thủ',
        datetime: new Date('2025-11-07T19:00:00Z'),
        location: 'Sân bóng Thống Nhất',
        type: 'TRAINING',
        maxParticipants: 22,
        registrationDeadline: new Date('2025-11-07T12:00:00Z'),
      },
      {
        teamId: team.id,
        title: 'Giao hữu với đội ABC',
        description: 'Trận giao hữu với đội bóng ABC để rèn luyện kỹ năng thi đấu',
        datetime: new Date('2025-11-10T15:00:00Z'),
        location: 'Sân bóng Quận 1',
        type: 'FRIENDLY_MATCH',
        maxParticipants: 18,
        registrationDeadline: new Date('2025-11-09T18:00:00Z'),
      },
    ];

    for (const sessionData of sessions) {
      await prisma.trainingSession.create({
        data: sessionData,
      });
    }

    console.log(`✅ Created ${sessions.length} sample sessions`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleSessions();
