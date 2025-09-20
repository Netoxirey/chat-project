const request = require('supertest');
const app = require('../server');
const prisma = require('../database/connection');
const { hashPassword } = require('../utils/password');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user).toMatchObject({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    it('should fail to register with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('valid email address');
    });

    it('should fail to register with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'weak',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain(
        'Password must be at least 8 characters'
      );
    });

    it('should fail to register with duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'TestPass123!',
      };

      // Create user first
      await request(app).post('/api/auth/register').send(userData).expect(201);

      // Try to create user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await hashPassword('TestPass123!');
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toMatchObject({
        email: loginData.email,
        username: 'testuser',
      });
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should fail to login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail to login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      // Create a test user and get auth token
      const hashedPassword = await hashPassword('TestPass123!');
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          username: 'testuser',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Login to get token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'TestPass123!',
      });

      authToken = loginResponse.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should fail to get profile without token', async () => {
      const response = await request(app).get('/api/auth/profile').expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Access token is required');
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid token');
    });
  });
});
