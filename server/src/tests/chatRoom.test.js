const request = require('supertest');
const app = require('../server');
const prisma = require('../database/connection');
const { hashPassword } = require('../utils/password');

describe('Chat Room API', () => {
  let authToken;
  let user1, user2, user3;

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await hashPassword('TestPass123!');

    user1 = await prisma.user.create({
      data: {
        email: 'user1@example.com',
        username: 'user1',
        password: hashedPassword,
        firstName: 'User',
        lastName: 'One',
      },
    });

    user2 = await prisma.user.create({
      data: {
        email: 'user2@example.com',
        username: 'user2',
        password: hashedPassword,
        firstName: 'User',
        lastName: 'Two',
      },
    });

    user3 = await prisma.user.create({
      data: {
        email: 'user3@example.com',
        username: 'user3',
        password: hashedPassword,
        firstName: 'User',
        lastName: 'Three',
      },
    });

    // Login to get auth token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'user1@example.com',
      password: 'TestPass123!',
    });

    authToken = loginResponse.body.data.accessToken;
  });

  describe('POST /api/chat-rooms', () => {
    it('should create a chat room successfully', async () => {
      const chatRoomData = {
        name: 'Test Chat Room',
        description: 'A test chat room',
        type: 'GROUP',
        userIds: [user2.id, user3.id],
      };

      const response = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chatRoomData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Chat room created successfully');
      expect(response.body.data.chatRoom).toMatchObject({
        name: chatRoomData.name,
        description: chatRoomData.description,
        type: chatRoomData.type,
        creatorId: user1.id,
      });

      // Verify chat room was created in database
      const chatRoom = await prisma.chatRoom.findFirst({
        where: { name: chatRoomData.name },
        include: { users: true },
      });
      expect(chatRoom).toBeTruthy();
      expect(chatRoom.users).toHaveLength(3); // creator + 2 added users
    });

    it('should create a direct chat room successfully', async () => {
      const chatRoomData = {
        name: 'Direct Chat',
        type: 'DIRECT',
        userIds: [user2.id],
      };

      const response = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chatRoomData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.chatRoom.type).toBe('DIRECT');
    });

    it('should fail to create chat room without name', async () => {
      const chatRoomData = {
        description: 'A test chat room',
        type: 'GROUP',
      };

      const response = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chatRoomData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Chat room name is required');
    });

    it('should fail to create chat room with empty name', async () => {
      const chatRoomData = {
        name: '',
        type: 'GROUP',
      };

      const response = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(chatRoomData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Chat room name cannot be empty');
    });
  });

  describe('GET /api/chat-rooms', () => {
    beforeEach(async () => {
      // Create test chat rooms
      const chatRoom1 = await prisma.chatRoom.create({
        data: {
          name: 'Chat Room 1',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      const chatRoom2 = await prisma.chatRoom.create({
        data: {
          name: 'Chat Room 2',
          type: 'GROUP',
          creatorId: user2.id,
        },
      });

      // Add users to chat rooms
      await prisma.chatRoomUser.createMany({
        data: [
          { userId: user1.id, chatRoomId: chatRoom1.id },
          { userId: user2.id, chatRoomId: chatRoom1.id },
          { userId: user1.id, chatRoomId: chatRoom2.id },
          { userId: user2.id, chatRoomId: chatRoom2.id },
        ],
      });
    });

    it('should get user chat rooms successfully', async () => {
      const response = await request(app)
        .get('/api/chat-rooms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.chatRooms).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      });
    });

    it('should get user chat rooms with pagination', async () => {
      const response = await request(app)
        .get('/api/chat-rooms?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.chatRooms).toHaveLength(1);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: 2,
        pages: 2,
      });
    });
  });

  describe('GET /api/chat-rooms/:chatRoomId', () => {
    let chatRoom;

    beforeEach(async () => {
      // Create a test chat room
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Test Chat Room',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      // Add users to chat room
      await prisma.chatRoomUser.createMany({
        data: [
          { userId: user1.id, chatRoomId: chatRoom.id },
          { userId: user2.id, chatRoomId: chatRoom.id },
        ],
      });
    });

    it('should get chat room by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.chatRoom).toMatchObject({
        id: chatRoom.id,
        name: chatRoom.name,
        type: chatRoom.type,
        creatorId: user1.id,
      });
      expect(response.body.data.chatRoom.users).toHaveLength(2);
    });

    it('should fail to get chat room if user is not a member', async () => {
      // Login as user3 who is not a member
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user3@example.com',
        password: 'TestPass123!',
      });

      const user3Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not a member of this chat room');
    });
  });

  describe('POST /api/chat-rooms/:chatRoomId/users', () => {
    let chatRoom;

    beforeEach(async () => {
      // Create a test chat room
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Test Chat Room',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      // Add user1 to chat room
      await prisma.chatRoomUser.create({
        data: {
          userId: user1.id,
          chatRoomId: chatRoom.id,
        },
      });
    });

    it('should add user to chat room successfully', async () => {
      const response = await request(app)
        .post(`/api/chat-rooms/${chatRoom.id}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId: user2.id })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(
        'User added to chat room successfully'
      );

      // Verify user was added to chat room
      const membership = await prisma.chatRoomUser.findFirst({
        where: {
          userId: user2.id,
          chatRoomId: chatRoom.id,
        },
      });
      expect(membership).toBeTruthy();
      expect(membership.isActive).toBe(true);
    });

    it('should fail to add user without userId', async () => {
      const response = await request(app)
        .post(`/api/chat-rooms/${chatRoom.id}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('User ID is required');
    });

    it('should fail to add user if requester is not a member', async () => {
      // Login as user3 who is not a member
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user3@example.com',
        password: 'TestPass123!',
      });

      const user3Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .post(`/api/chat-rooms/${chatRoom.id}/users`)
        .set('Authorization', `Bearer ${user3Token}`)
        .send({ userId: user2.id })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not a member of this chat room');
    });
  });

  describe('DELETE /api/chat-rooms/:chatRoomId/users/:userId', () => {
    let chatRoom;

    beforeEach(async () => {
      // Create a test chat room
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Test Chat Room',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      // Add users to chat room
      await prisma.chatRoomUser.createMany({
        data: [
          { userId: user1.id, chatRoomId: chatRoom.id },
          { userId: user2.id, chatRoomId: chatRoom.id },
        ],
      });
    });

    it('should remove user from chat room successfully', async () => {
      const response = await request(app)
        .delete(`/api/chat-rooms/${chatRoom.id}/users/${user2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe(
        'User removed from chat room successfully'
      );

      // Verify user was removed from chat room
      const membership = await prisma.chatRoomUser.findFirst({
        where: {
          userId: user2.id,
          chatRoomId: chatRoom.id,
          isActive: true,
        },
      });
      expect(membership).toBeNull();
    });

    it('should fail to remove non-member user', async () => {
      const response = await request(app)
        .delete(`/api/chat-rooms/${chatRoom.id}/users/${user3.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not a member of this chat room');
    });
  });

  describe('PUT /api/chat-rooms/:chatRoomId', () => {
    let chatRoom;

    beforeEach(async () => {
      // Create a test chat room
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Test Chat Room',
          description: 'Original description',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      // Add user1 to chat room
      await prisma.chatRoomUser.create({
        data: {
          userId: user1.id,
          chatRoomId: chatRoom.id,
        },
      });
    });

    it('should update chat room successfully', async () => {
      const updateData = {
        name: 'Updated Chat Room Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Chat room updated successfully');
      expect(response.body.data.chatRoom).toMatchObject(updateData);

      // Verify chat room was updated in database
      const updatedChatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoom.id },
      });
      expect(updatedChatRoom.name).toBe(updateData.name);
      expect(updatedChatRoom.description).toBe(updateData.description);
    });

    it('should fail to update chat room if user is not the creator', async () => {
      // Login as user2 who is not the creator
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user2@example.com',
        password: 'TestPass123!',
      });

      const user2Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .put(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'Trying to update' })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'Only the creator can update this chat room'
      );
    });
  });

  describe('DELETE /api/chat-rooms/:chatRoomId', () => {
    let chatRoom;

    beforeEach(async () => {
      // Create a test chat room
      chatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Test Chat Room',
          type: 'GROUP',
          creatorId: user1.id,
        },
      });

      // Add user1 to chat room
      await prisma.chatRoomUser.create({
        data: {
          userId: user1.id,
          chatRoomId: chatRoom.id,
        },
      });
    });

    it('should delete chat room successfully', async () => {
      const response = await request(app)
        .delete(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Chat room deleted successfully');

      // Verify chat room was soft deleted
      const deletedChatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoom.id },
      });
      expect(deletedChatRoom.isActive).toBe(false);
    });

    it('should fail to delete chat room if user is not the creator', async () => {
      // Login as user2 who is not the creator
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user2@example.com',
        password: 'TestPass123!',
      });

      const user2Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .delete(`/api/chat-rooms/${chatRoom.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'Only the creator can delete this chat room'
      );
    });
  });
});
