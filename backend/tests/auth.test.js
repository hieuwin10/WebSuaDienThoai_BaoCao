const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');

describe('Auth API Tests', () => {
  let testUser = {
    username: 'testuser_' + Date.now(),
    password: 'password123',
    email: `test_${Date.now()}@example.com`,
    fullName: 'Test User'
  };

  beforeAll(async () => {
    await roleModel.findOneAndUpdate(
      { name: 'USER' },
      { name: 'USER' },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', testUser.username);
  });

  it('should fail to login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should return 400 for incomplete registration data', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'missingfields' });
    
    expect(res.statusCode).toBe(400);
  });
});
