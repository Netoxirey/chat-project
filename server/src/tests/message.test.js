const request = require('supertest');
const app = require('../server');
const prisma = require('../database/connection');
const { hashPassword } = require('../utils/password');

describe('Message API', () => {
  let authToken;
  let user1, user2, chatRoom;

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

    // Login to get auth token
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'user1@example.com',
      password: 'TestPass123!',
    });

    authToken = loginResponse.body.data.accessToken;
  });

  describe('POST /api/messages', () => {
    it('should send a message to a chat room successfully', async () => {
      const messageData = {
        content: 'Hello, this is a test message!',
        type: 'TEXT',
        chatRoomId: chatRoom.id,
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Message sent successfully');
      expect(response.body.data.message).toMatchObject({
        content: messageData.content,
        type: messageData.type,
        senderId: user1.id,
        chatRoomId: chatRoom.id,
      });
      expect(response.body.data.message.sender).toMatchObject({
        id: user1.id,
        username: user1.username,
      });

      // Verify message was created in database
      const message = await prisma.message.findFirst({
        where: { content: messageData.content },
      });
      expect(message).toBeTruthy();
    });

    it('should send a direct message successfully', async () => {
      const messageData = {
        content: 'Hello, this is a direct message!',
        type: 'TEXT',
        receiverId: user2.id,
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.message).toMatchObject({
        content: messageData.content,
        type: messageData.type,
        senderId: user1.id,
        receiverId: user2.id,
      });
    });

    it('should fail to send message without content', async () => {
      const messageData = {
        type: 'TEXT',
        chatRoomId: chatRoom.id,
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Message content is required');
    });

    it('should fail to send message without receiver or chat room', async () => {
      const messageData = {
        content: 'Hello, this is a test message!',
        type: 'TEXT',
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'Either receiverId or chatRoomId must be provided'
      );
    });

    it('should fail to send message to non-existent chat room', async () => {
      const messageData = {
        content: 'Hello, this is a test message!',
        type: 'TEXT',
        chatRoomId: 'non-existent-id',
      };

      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not a member of this chat room');
    });
  });

  describe('GET /api/messages/chat-room/:chatRoomId', () => {
    beforeEach(async () => {
      // Create some test messages
      await prisma.message.createMany({
        data: [
          {
            content: 'First message',
            senderId: user1.id,
            chatRoomId: chatRoom.id,
          },
          {
            content: 'Second message',
            senderId: user2.id,
            chatRoomId: chatRoom.id,
          },
          {
            content: 'Third message',
            senderId: user1.id,
            chatRoomId: chatRoom.id,
          },
        ],
      });
    });

    it('should get chat room messages successfully', async () => {
      const response = await request(app)
        .get(`/api/messages/chat-room/${chatRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.messages).toHaveLength(3);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 20,
        total: 3,
        pages: 1,
      });

      // Check message order (should be descending by createdAt)
      expect(response.body.data.messages[0].content).toBe('Third message');
      expect(response.body.data.messages[1].content).toBe('Second message');
      expect(response.body.data.messages[2].content).toBe('First message');
    });

    it('should get chat room messages with pagination', async () => {
      const response = await request(app)
        .get(`/api/messages/chat-room/${chatRoom.id}?page=1&limit=2`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.messages).toHaveLength(2);
      expect(response.body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        pages: 2,
      });
    });

    it('should fail to get messages from non-member chat room', async () => {
      // Create another chat room that user1 is not a member of
      const otherChatRoom = await prisma.chatRoom.create({
        data: {
          name: 'Other Chat Room',
          type: 'GROUP',
          creatorId: user2.id,
        },
      });

      const response = await request(app)
        .get(`/api/messages/chat-room/${otherChatRoom.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not a member of this chat room');
    });
  });

  describe('PUT /api/messages/:messageId', () => {
    let message;

    beforeEach(async () => {
      // Create a test message
      message = await prisma.message.create({
        data: {
          content: 'Original message content',
          senderId: user1.id,
          chatRoomId: chatRoom.id,
        },
      });
    });

    it('should edit message successfully', async () => {
      const updateData = {
        content: 'Updated message content',
      };

      const response = await request(app)
        .put(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Message updated successfully');
      expect(response.body.data.message).toMatchObject({
        content: updateData.content,
        isEdited: true,
      });
      expect(response.body.data.message.editedAt).toBeDefined();

      // Verify message was updated in database
      const updatedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });
      expect(updatedMessage.content).toBe(updateData.content);
      expect(updatedMessage.isEdited).toBe(true);
    });

    it('should fail to edit message without content', async () => {
      const response = await request(app)
        .put(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Message content is required');
    });

    it('should fail to edit message from another user', async () => {
      // Login as user2
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user2@example.com',
        password: 'TestPass123!',
      });

      const user2Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .put(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ content: "Trying to edit someone else's message" })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'You can only edit your own messages'
      );
    });
  });

  describe('DELETE /api/messages/:messageId', () => {
    let message;

    beforeEach(async () => {
      // Create a test message
      message = await prisma.message.create({
        data: {
          content: 'Message to be deleted',
          senderId: user1.id,
          chatRoomId: chatRoom.id,
        },
      });
    });

    it('should delete message successfully', async () => {
      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Message deleted successfully');

      // Verify message was deleted from database
      const deletedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });
      expect(deletedMessage).toBeNull();
    });

    it('should fail to delete message from another user', async () => {
      // Login as user2
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'user2@example.com',
        password: 'TestPass123!',
      });

      const user2Token = loginResponse.body.data.accessToken;

      const response = await request(app)
        .delete(`/api/messages/${message.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'You can only delete your own messages'
      );
    });
  });
});
