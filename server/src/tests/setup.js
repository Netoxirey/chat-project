const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.TEST_DATABASE_URL ||
        'postgresql://username:password@localhost:5432/chat_db_test?schema=public',
    },
  },
});

// Clean up database before each test
beforeEach(async () => {
  // Delete all records in reverse order of dependencies
  await prisma.message.deleteMany();
  await prisma.chatRoomUser.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.user.deleteMany();
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Make prisma available globally for tests
global.prisma = prisma;
