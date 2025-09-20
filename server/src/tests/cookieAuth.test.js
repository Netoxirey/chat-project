const request = require('supertest');
const app = require('../server');
const prisma = require('../database/connection');
const { hashPassword } = require('../utils/password');

describe('Cookie-based Authentication API', () => {
  describe('POST /api/cookie-auth/login', () => {
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

    it('should login successfully and set cookies', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      const response = await request(app)
        .post('/api/cookie-auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toMatchObject({
        email: loginData.email,
        username: 'testuser',
      });

      // Check that cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']).toHaveLength(2); // accessToken and refreshToken

      // Check cookie properties
      const cookies = response.headers['set-cookie'];
      const accessTokenCookie = cookies.find(cookie =>
        cookie.includes('accessToken')
      );
      const refreshTokenCookie = cookies.find(cookie =>
        cookie.includes('refreshToken')
      );

      expect(accessTokenCookie).toContain('HttpOnly');
      expect(accessTokenCookie).toContain('SameSite=Strict');
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('SameSite=Strict');
    });

    it('should fail to login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const response = await request(app)
        .post('/api/cookie-auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/cookie-auth/profile', () => {
    let cookies;

    beforeEach(async () => {
      // Create a test user and login to get cookies
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

      // Login to get cookies
      const loginResponse = await request(app)
        .post('/api/cookie-auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      cookies = loginResponse.headers['set-cookie'];
    });

    it('should get user profile with valid cookies', async () => {
      const response = await request(app)
        .get('/api/cookie-auth/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toMatchObject({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
      });
    });

    it('should fail to get profile without cookies', async () => {
      const response = await request(app)
        .get('/api/cookie-auth/profile')
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Access token is required');
    });

    it('should fail to get profile with invalid cookies', async () => {
      const response = await request(app)
        .get('/api/cookie-auth/profile')
        .set('Cookie', 'accessToken=invalid-token')
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('POST /api/cookie-auth/logout', () => {
    let cookies;

    beforeEach(async () => {
      // Create a test user and login to get cookies
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

      // Login to get cookies
      const loginResponse = await request(app)
        .post('/api/cookie-auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      cookies = loginResponse.headers['set-cookie'];
    });

    it('should logout successfully and clear cookies', async () => {
      const response = await request(app)
        .post('/api/cookie-auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logout successful');

      // Check that cookies are cleared
      const clearCookies = response.headers['set-cookie'];
      expect(clearCookies).toBeDefined();
      expect(clearCookies).toHaveLength(2); // Two clear cookie headers

      // Check that cookies are set to expire immediately
      const accessTokenClear = clearCookies.find(cookie =>
        cookie.includes('accessToken')
      );
      const refreshTokenClear = clearCookies.find(cookie =>
        cookie.includes('refreshToken')
      );

      expect(accessTokenClear).toContain('Max-Age=0');
      expect(refreshTokenClear).toContain('Max-Age=0');
    });
  });

  describe('POST /api/cookie-auth/refresh-token', () => {
    let cookies;

    beforeEach(async () => {
      // Create a test user and login to get cookies
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

      // Login to get cookies
      const loginResponse = await request(app)
        .post('/api/cookie-auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!',
        });

      cookies = loginResponse.headers['set-cookie'];
    });

    it('should refresh token successfully using cookies', async () => {
      const response = await request(app)
        .post('/api/cookie-auth/refresh-token')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data.expiresIn).toBeDefined();

      // Check that new access token cookie is set
      const newCookies = response.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      expect(newCookies.some(cookie => cookie.includes('accessToken'))).toBe(
        true
      );
    });

    it('should refresh token successfully using body', async () => {
      // Extract refresh token from cookies
      const refreshTokenCookie = cookies.find(cookie =>
        cookie.includes('refreshToken')
      );
      const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

      const response = await request(app)
        .post('/api/cookie-auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Token refreshed successfully');
    });
  });
});
