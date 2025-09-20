const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user1 = await prisma.user.upsert({
        where: { email: 'john@example.com' },
        update: {},
        create: {
            email: 'john@example.com',
            username: 'john_doe',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            isOnline: true,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'jane@example.com' },
        update: {},
        create: {
            email: 'jane@example.com',
            username: 'jane_smith',
            password: hashedPassword,
            firstName: 'Jane',
            lastName: 'Smith',
            isOnline: true,
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'bob@example.com' },
        update: {},
        create: {
            email: 'bob@example.com',
            username: 'bob_wilson',
            password: hashedPassword,
            firstName: 'Bob',
            lastName: 'Wilson',
            isOnline: false,
        },
    });

    // Create chat rooms
    const directChat = await prisma.chatRoom.create({
        data: {
            name: 'Direct Chat',
            type: 'DIRECT',
            creatorId: user1.id,
        },
    });

    const groupChat = await prisma.chatRoom.create({
        data: {
            name: 'General Discussion',
            description: 'A place for general discussions',
            type: 'GROUP',
            creatorId: user1.id,
        },
    });

    // Add users to chat rooms
    await prisma.chatRoomUser.createMany({
        data: [
            { userId: user1.id, chatRoomId: directChat.id },
            { userId: user2.id, chatRoomId: directChat.id },
            { userId: user1.id, chatRoomId: groupChat.id },
            { userId: user2.id, chatRoomId: groupChat.id },
            { userId: user3.id, chatRoomId: groupChat.id },
        ],
    });

    // Create sample messages
    await prisma.message.createMany({
        data: [
            {
                content: 'Hello! How are you?',
                senderId: user1.id,
                receiverId: user2.id,
                type: 'TEXT',
            },
            {
                content: 'Hi! I\'m doing great, thanks for asking!',
                senderId: user2.id,
                receiverId: user1.id,
                type: 'TEXT',
            },
            {
                content: 'Welcome to the group chat!',
                senderId: user1.id,
                chatRoomId: groupChat.id,
                type: 'TEXT',
            },
            {
                content: 'Thanks for the invite!',
                senderId: user2.id,
                chatRoomId: groupChat.id,
                type: 'TEXT',
            },
        ],
    });

    console.log('✅ Database seeded successfully!');
    console.log(`Created users: ${user1.username}, ${user2.username}, ${user3.username}`);
    console.log(`Created chat rooms: ${directChat.name}, ${groupChat.name}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
