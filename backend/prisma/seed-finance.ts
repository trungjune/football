import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Data từ file CSV "FC Vui Vẻ - Quỹ đội bóng.csv"
const teamMembersData = [
  {
    stt: 1,
    name: 'Nguyễn Hữu Phúc',
    role: 'Chủ tịch/Đội trưởng',
    birthYear: 1987,
    isWorking: true,
    isStudent: false,
    position: 'Cánh/Thòng',
    rank: 3,
    phone: '0969240487',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 100000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 2,
    name: 'Vũ Minh Hoàng',
    role: 'Thu họ',
    birthYear: 1992,
    isWorking: true,
    isStudent: false,
    position: 'Gôn',
    rank: 3,
    phone: '0948395333',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 3,
    name: 'Trịnh Hoàng Trung',
    role: 'Giám đốc kỹ thuật (CTO)',
    birthYear: 1996,
    isWorking: true,
    isStudent: false,
    position: 'Trên',
    rank: 4,
    phone: '0376861794',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 4,
    name: 'Chu Thanh Quang',
    role: 'Trưởng ban hậu cần',
    birthYear: 2002,
    isWorking: false,
    isStudent: true,
    position: 'Giữa',
    rank: 5,
    phone: null,
    monthlyPayments: {}, // Không đóng phí (x trong CSV)
  },
  {
    stt: 5,
    name: 'Giáp Văn Chiến',
    role: 'Người thừa kế',
    birthYear: 2001,
    isWorking: true,
    isStudent: false,
    position: 'Thòng',
    rank: 4,
    phone: '0397862092',
    monthlyPayments: {
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 6,
    name: 'Lê Công Hậu',
    role: 'Giám đốc khối (BU LÍT)',
    birthYear: 1995,
    isWorking: true,
    isStudent: false,
    position: 'Cánh',
    rank: 3,
    phone: '0963359626',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 7,
    name: 'Nguyễn Anh Thắng',
    role: 'Xách nước nhặt bóng',
    birthYear: 2002,
    isWorking: false,
    isStudent: true,
    position: 'Gôn',
    rank: 4,
    phone: null,
    monthlyPayments: {
      1: 100000,
      2: 100000,
      3: 100000,
      4: 100000,
      5: 100000,
      6: 100000,
      7: 100000,
      8: 100000,
      9: 100000,
      10: 100000,
    },
  },
  {
    stt: 8,
    name: 'Nguyễn Minh Tuân',
    role: '',
    birthYear: 1991,
    isWorking: true,
    isStudent: false,
    position: 'Trên',
    rank: 3,
    phone: '0889133991',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 9,
    name: 'Nguyễn Sỹ Hùng',
    role: '',
    birthYear: 2002,
    isWorking: false,
    isStudent: true,
    position: 'Cánh/Trên',
    rank: 3,
    phone: '0398570078',
    monthlyPayments: {
      1: 100000,
      2: 200000,
      3: 100000,
      4: 100000,
      5: 100000,
      6: 100000,
      7: 100000,
      9: 100000,
      10: 100000,
    },
  },
  {
    stt: 10,
    name: 'Đỗ Linh',
    role: '',
    birthYear: 2005,
    isWorking: false,
    isStudent: true,
    position: 'Trên',
    rank: 3,
    phone: '0819168381',
    monthlyPayments: {
      2: 100000,
      3: 100000,
      4: 100000,
      8: 100000,
      9: 100000,
      10: 100000,
    },
  },
  {
    stt: 11,
    name: 'Ngô Quốc Thắng',
    role: '',
    birthYear: 2002,
    isWorking: true,
    isStudent: false,
    position: 'Cánh',
    rank: 3,
    phone: '0986584592',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      7: 200000,
      8: 200000,
      9: 100000,
      10: 200000,
    },
  },
  {
    stt: 12,
    name: 'Quân',
    role: '',
    birthYear: 2001,
    isWorking: true,
    isStudent: false,
    position: 'Thòng',
    rank: 4,
    phone: null,
    monthlyPayments: {
      1: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
    },
  },
  {
    stt: 13,
    name: 'Ngô Văn Tân',
    role: '',
    birthYear: 1986,
    isWorking: true,
    isStudent: false,
    position: 'Trên',
    rank: 3,
    phone: null,
    monthlyPayments: {}, // Không đóng phí (x trong CSV)
  },
  {
    stt: 14,
    name: 'Anh Cường',
    role: 'Dự bị chiến lược',
    birthYear: 1990,
    isWorking: true,
    isStudent: false,
    position: 'Gôn/Cánh',
    rank: 3,
    phone: '0939483688',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 15,
    name: 'Đỗ Việt Hùng',
    role: '',
    birthYear: 1992,
    isWorking: true,
    isStudent: false,
    position: 'Cánh/Giữa',
    rank: 4,
    phone: null,
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 16,
    name: 'Bùi Bảo Ngọc',
    role: '',
    birthYear: 1993,
    isWorking: true,
    isStudent: false,
    position: 'Cánh/Thòng',
    rank: 3,
    phone: null,
    monthlyPayments: {
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 17,
    name: 'Mai Thành Chung',
    role: 'Giám đốc đối ngoại',
    birthYear: 1989,
    isWorking: true,
    isStudent: false,
    position: 'Giữa',
    rank: 4,
    phone: '0987669915',
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 18,
    name: 'Anh Lê Bắc',
    role: '',
    birthYear: 1989,
    isWorking: true,
    isStudent: false,
    position: 'Thòng',
    rank: 4,
    phone: null,
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
    },
  },
  {
    stt: 19,
    name: 'Ma Thế Thiêm',
    role: '',
    birthYear: 1997,
    isWorking: true,
    isStudent: false,
    position: 'Cánh',
    rank: 3,
    phone: null,
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 20,
    name: 'Anh Lê Ngọc Hiền',
    role: '',
    birthYear: 1989,
    isWorking: true,
    isStudent: false,
    position: 'Giữa',
    rank: 5,
    phone: null,
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
    },
  },
  {
    stt: 21,
    name: 'Đỗ Văn Thường',
    role: '',
    birthYear: 1988,
    isWorking: true,
    isStudent: false,
    position: 'Gôn/Cánh',
    rank: 3,
    phone: null,
    monthlyPayments: {
      1: 200000,
      2: 200000,
      3: 200000,
      4: 200000,
      5: 200000,
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
      11: 200000,
      12: 200000,
    },
  },
  {
    stt: 22,
    name: 'Trần Công Phước',
    role: '',
    birthYear: 2002,
    isWorking: false,
    isStudent: true,
    position: 'Cánh',
    rank: 4,
    phone: null,
    monthlyPayments: {
      6: 200000,
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 23,
    name: 'Hà Quang Phong',
    role: '',
    birthYear: 2002,
    isWorking: true,
    isStudent: false,
    position: 'Cánh',
    rank: 3,
    phone: null,
    monthlyPayments: {
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
    },
  },
  {
    stt: 24,
    name: 'Anh Nguyễn Văn Hải',
    role: '',
    birthYear: 1984,
    isWorking: true,
    isStudent: false,
    position: 'Trên',
    rank: 3,
    phone: null,
    monthlyPayments: {
      7: 200000,
      8: 200000,
      9: 200000,
      10: 200000,
      11: 200000,
      12: 200000,
    },
  },
  {
    stt: 25,
    name: 'Nguyễn Văn Tuyền',
    role: '',
    birthYear: 2003,
    isWorking: false,
    isStudent: true,
    position: 'Giữa',
    rank: 5,
    phone: null,
    monthlyPayments: {
      7: 100000,
      8: 100000,
      9: 100000,
    },
  },
  {
    stt: 26,
    name: 'Văn Thưởng',
    role: '',
    birthYear: null,
    isWorking: false,
    isStudent: false,
    position: '',
    rank: 3,
    phone: null,
    monthlyPayments: {
      10: 200000,
    },
  },
];

// Mapping vị trí từ CSV sang enum Position
const positionMapping: Record<string, string> = {
  Gôn: 'GOALKEEPER',
  Trên: 'FORWARD',
  Giữa: 'MIDFIELDER',
  Cánh: 'MIDFIELDER',
  Thòng: 'DEFENDER',
  'Cánh/Thòng': 'MIDFIELDER',
  'Cánh/Trên': 'MIDFIELDER',
  'Gôn/Cánh': 'GOALKEEPER',
  'Cánh/Giữa': 'MIDFIELDER',
  '': 'MIDFIELDER',
};

export async function seedFinanceData() {
  console.log('🌱 Seeding finance data...');

  try {
    // Tạo team FC Vui Vẻ
    const team = await prisma.team.upsert({
      where: { id: 'fc-vui-ve' },
      update: {},
      create: {
        id: 'fc-vui-ve',
        name: 'FC Vui Vẻ',
        description: 'Đội bóng sân 7 FC Vui Vẻ - Sân tài chính số 2',
      },
    });

    console.log('✅ Team created:', team.name);

    // Tạo users và members từ CSV data
    const createdMembers = [];

    for (const memberData of teamMembersData) {
      const email = `${memberData.name.toLowerCase().replace(/\s+/g, '.')}.fcvuive@gmail.com`;
      const birthDate = memberData.birthYear ? new Date(memberData.birthYear, 0, 1) : null;

      // Hash default password
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Tạo user - handle phone unique constraint
      let user;
      try {
        user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            password: hashedPassword,
            phone: memberData.phone || null,
            role: memberData.role?.includes('Chủ tịch') ? 'ADMIN' : 'MEMBER',
          },
        });
      } catch (error: any) {
        if (error.code === 'P2002' && error.meta?.target?.includes('phone')) {
          // Phone already exists, create user without phone
          user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
              password: hashedPassword,
              phone: null, // Skip phone to avoid conflict
              role: memberData.role?.includes('Chủ tịch') ? 'ADMIN' : 'MEMBER',
            },
          });
          console.log(
            `⚠️ Phone ${memberData.phone} already exists, created user without phone for ${email}`,
          );
        } else {
          throw error;
        }
      }

      // Tạo member
      const member = await prisma.member.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          fullName: memberData.name,
          dateOfBirth: birthDate,
          position: (positionMapping[memberData.position] as any) || 'MIDFIELDER',
          memberType: memberData.isStudent ? 'TRIAL' : 'OFFICIAL',
          status: 'ACTIVE',
        },
      });

      // Tạo team member relationship
      await prisma.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: user.id,
          },
        },
        update: {},
        create: {
          teamId: team.id,
          userId: user.id,
          memberId: member.id,
        },
      });

      createdMembers.push({ member, memberData });
    }

    console.log(`✅ Created ${createdMembers.length} members`);

    // Tạo monthly fees cho năm 2025
    const monthlyFees = [];
    for (let month = 1; month <= 12; month++) {
      const fee = await prisma.fee.create({
        data: {
          teamId: team.id,
          title: `Phí thành viên tháng ${month}/2025`,
          description: `Phí đóng góp quỹ đội bóng tháng ${month}/2025`,
          amount: 150000, // Số tiền trung bình
          type: 'MONTHLY',
          dueDate: new Date(2025, month - 1, 15), // Hạn đóng ngày 15 hàng tháng
        },
      });
      monthlyFees.push({ month, fee });
    }

    console.log('✅ Created 12 monthly fees for 2025');

    // Tạo payments dựa trên CSV data
    let totalPayments = 0;

    for (const { member, memberData } of createdMembers) {
      for (const [monthStr, amount] of Object.entries(memberData.monthlyPayments)) {
        const month = parseInt(monthStr);
        const monthlyFee = monthlyFees.find(f => f.month === month)?.fee;

        if (monthlyFee && typeof amount === 'number' && amount > 0) {
          await prisma.payment.create({
            data: {
              feeId: monthlyFee.id,
              memberId: member.id,
              amount: amount,
              method: 'BANK_TRANSFER',
              status: 'COMPLETED',
              paidAt: new Date(2025, month - 1, Math.floor(Math.random() * 14) + 1), // Random ngày 1-15
            },
          });
          totalPayments++;
        }
      }
    }

    console.log(`✅ Created ${totalPayments} payments`);

    // Tạo một số phí đặc biệt
    const specialFees = [
      {
        title: 'Phí áo đồng phục 2025',
        description: 'Đóng góp mua áo đồng phục mới cho đội',
        amount: 300000,
        type: 'SPECIAL' as const,
        dueDate: new Date(2025, 2, 28),
      },
      {
        title: 'Phí tham gia giải đấu',
        description: 'Lệ phí đăng ký tham gia giải đấu mùa xuân',
        amount: 500000,
        type: 'SPECIAL' as const,
        dueDate: new Date(2025, 3, 15),
      },
    ];

    for (const feeData of specialFees) {
      await prisma.fee.create({
        data: {
          ...feeData,
          teamId: team.id,
        },
      });
    }

    console.log('✅ Created special fees');

    console.log('🎉 Finance data seeding completed successfully!');

    // In thống kê
    const stats = await prisma.payment.aggregate({
      where: {
        fee: { teamId: team.id },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    console.log(`📊 Statistics:`);
    console.log(`   - Total members: ${createdMembers.length}`);
    console.log(`   - Total payments: ${stats._count}`);
    console.log(`   - Total amount: ${stats._sum.amount?.toLocaleString('vi-VN')} VNĐ`);
  } catch (error) {
    console.error('❌ Error seeding finance data:', error);
    throw error;
  }
}

// Chạy seed nếu file được execute trực tiếp
if (require.main === module) {
  seedFinanceData()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
