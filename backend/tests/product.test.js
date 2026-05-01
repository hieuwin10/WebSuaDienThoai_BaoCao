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
    username: 'staff_' + Date.now(),
    password: 'password123',
    email: `staff_${Date.now()}@test.com`,
    fullName: 'Staff Member'
  };

  beforeAll(async () => {
    // Ensure "ADMIN" role exists
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' },
      { name: 'ADMIN' },
      { upsert: true, new: true }
    );

    // Create an admin user for testing CRUD
    const user = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, username: 'admin_test_' + Date.now() });
    
    // Manually promote to ADMIN in DB for testing delete
    await userModel.findByIdAndUpdate(user.body._id, { role_id: adminRole._id });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: user.body.username,
        password: testUser.password
      });
    
    cookie = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await deviceModel.deleteMany({ device_name: 'Test Device' });
    await userModel.deleteMany({ email: /@test.com/ });
  });

  it('should create a new device', async () => {
    const res = await request(app)
      .post('/api/v1/devices')
      .set('Cookie', cookie)
      .send({
        device_name: 'Test Device',
        model: 'Mock 1.0',
        serial_number: 'SN' + Date.now()
      });
    
    expect(res.statusCode).toBe(200);
    deviceId = res.body._id;
  });

  it('should get all devices', async () => {
    const res = await request(app)
      .get('/api/v1/devices')
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a device by id', async () => {
    const res = await request(app)
      .get(`/api/v1/devices/${deviceId}`)
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.device_name).toBe('Test Device');
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
