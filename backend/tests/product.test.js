const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const deviceModel = require('../schemas/devices');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');

describe('Device (Product) API Tests', () => {
  let cookie;
  let deviceId;
  let testUser = {
    username: 'staff' + Math.floor(Math.random() * 1000000),
    password: 'TestPassword123!',
    email: `staff${Date.now()}@test.com`,
    fullName: 'Staff Member'
  };

  beforeAll(async () => {
    // Ensure "ADMIN" role exists
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' },
      { name: 'ADMIN' },
      { upsert: true, returnDocument: 'after' }
    );

    // Create an admin user for testing CRUD
    const user = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, username: 'admintest' + Math.floor(Math.random() * 1000000) });
    
    if (user.statusCode !== 200) {
      throw new Error(`Failed to register admin for test: ${JSON.stringify(user.body)}`);
    }

    // Manually promote to ADMIN in DB for testing delete
    await userModel.findByIdAndUpdate(user.body._id, { role: adminRole._id });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: user.body.username,
        password: testUser.password
      });
    
    cookie = loginRes.headers['set-cookie'];
    if (!cookie) {
      throw new Error('Failed to get auth cookie for tests');
    }
  });

  afterAll(async () => {
    await deviceModel.deleteMany({ brand: 'Apple' });
    await userModel.deleteMany({ email: /@test.com/ });
  });

  it('should create a new device', async () => {
    const user = await userModel.findOne({ username: /admin/ });
    
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Cookie', cookie)
      .send({
        brand: 'Apple',
        model_name: 'iPhone 15 Pro',
        imei: 'IMEI' + Math.floor(Math.random() * 10000000),
        customer_id: user._id,
        condition_on_arrival: 'Mới 100%'
      });
    
    expect(res.statusCode).toBe(200);
    deviceId = res.body._id;
  });

  it('should fail to create a device with duplicate IMEI', async () => {
    const user = await userModel.findOne({ username: /admin/ });
    const existing = await deviceModel.findOne({ brand: 'Apple' });
    
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Cookie', cookie)
      .send({
        brand: 'Apple',
        model_name: 'iPhone 15 Pro',
        imei: existing.imei,
        customer_id: user._id
      });
    
    expect(res.statusCode).toBe(400);
  });

  it('should get all devices', async () => {
    const res = await request(app)
      .get('/api/v1/devices')
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update a device info', async () => {
    const res = await request(app)
      .put(`/api/v1/devices/${deviceId}`)
      .set('Cookie', cookie)
      .send({
        condition_on_arrival: 'Đã trầy xước nhẹ'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.condition_on_arrival).toBe('Đã trầy xước nhẹ');
  });

  it('should get a device by id', async () => {
    const res = await request(app)
      .get(`/api/v1/devices/${deviceId}`)
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.model_name).toBe('iPhone 15 Pro');
  });

  it('should return 404 for non-existent device id', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/v1/devices/${fakeId}`)
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(404);
  });

  it('should delete a device', async () => {
    const res = await request(app)
      .delete(`/api/v1/devices/${deviceId}`)
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
  });
});
