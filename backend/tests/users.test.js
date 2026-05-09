const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');

describe('Users API Tests (15 Cases)', () => {
  let adminToken = '';
  let modToken = '';
  let userToken = '';
  let testUserId = '';
  let targetUserId = '';

  let adminUser = {
    username: 'adminuser' + Date.now(),
    password: 'AdminPassword123!',
    email: `adminuser${Date.now()}@example.com`
  };

  let modUser = {
    username: 'moduser' + Date.now(),
    password: 'ModPassword123!',
    email: `moduser${Date.now()}@example.com`
  };

  let normalUser = {
    username: 'normaluser' + Date.now(),
    password: 'UserPassword123!',
    email: `normaluser${Date.now()}@example.com`
  };

  beforeAll(async () => {
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' }, { name: 'ADMIN' }, { upsert: true, returnDocument: 'after' }
    );
    const modRole = await roleModel.findOneAndUpdate(
      { name: 'MODERATOR' }, { name: 'MODERATOR' }, { upsert: true, returnDocument: 'after' }
    );
    const userRole = await roleModel.findOneAndUpdate(
      { name: 'USER' }, { name: 'USER' }, { upsert: true, returnDocument: 'after' }
    );

    const admin = new userModel({ ...adminUser, role: adminRole._id });
    await admin.save();
    
    const mod = new userModel({ ...modUser, role: modRole._id });
    await mod.save();

    const user = new userModel({ ...normalUser, role: userRole._id });
    await user.save();
    testUserId = user._id;

    // Đăng nhập lấy token
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      username: adminUser.username, password: adminUser.password
    });
    adminToken = adminLogin.headers['set-cookie'];

    const modLogin = await request(app).post('/api/v1/auth/login').send({
      username: modUser.username, password: modUser.password
    });
    modToken = modLogin.headers['set-cookie'];

    const userLogin = await request(app).post('/api/v1/auth/login').send({
      username: normalUser.username, password: normalUser.password
    });
    userToken = userLogin.headers['set-cookie'];

    // Tạo một user rác để làm mục tiêu test update/delete
    const target = new userModel({
      username: 'targetuser' + Date.now(),
      password: 'TargetPassword123!',
      email: `targetuser${Date.now()}@example.com`,
      role: userRole._id
    });
    await target.save();
    targetUserId = target._id;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
  });

  // --- GET USERS (3 cases) ---

  it('1. Admin lấy danh sách tất cả người dùng thành công', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. Moderator lấy danh sách tất cả người dùng thành công', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', modToken);
    expect(res.statusCode).toBe(200);
  });

  it('3. Khách hàng không được xem danh sách người dùng -> 403', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(403);
  });

  // --- GET USER BY ID (4 cases) ---

  it('4. Admin xem được thông tin của bất kỳ user nào', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${testUserId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(String(testUserId));
  });

  it('5. User xem được thông tin của chính mình', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${testUserId}`)
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(200);
  });

  it('6. User không xem được thông tin của user khác -> 403', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${targetUserId}`)
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(403);
  });

  it('7. Xem user với ID không tồn tại -> 404', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${new mongoose.Types.ObjectId()}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(404);
  });

  // --- CREATE USER (3 cases) ---

  it('8. Admin tạo mới user thủ công thành công', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', adminToken)
      .send({
        username: 'createduser' + Date.now(),
        password: 'Password123!',
        email: `created${Date.now()}@example.com`,
        role: targetUserId // Dùng ID này làm role tạm hoặc lấy role USER
      });
    expect(res.statusCode).toBe(200);
  });

  it('9. Khách hàng không được tạo user -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', userToken)
      .send({ username: 'hackuser' });
    expect(res.statusCode).toBe(403);
  });

  it('10. Lỗi khi tạo user thiếu trường bắt buộc', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Cookie', adminToken)
      .send({ username: 'missingfields' });
    expect(res.statusCode).toBe(400);
  });

  // --- UPDATE USER (2 cases) ---

  it('11. Admin cập nhật thông tin user thành công', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${targetUserId}`)
      .set('Cookie', adminToken)
      .send({ email: `updated${Date.now()}@example.com` });
    expect(res.statusCode).toBe(200);
  });

  it('12. Khách hàng không được cập nhật user khác -> 403', async () => {
    const res = await request(app)
      .put(`/api/v1/users/${targetUserId}`)
      .set('Cookie', userToken)
      .send({ email: 'hack@example.com' });
    expect(res.statusCode).toBe(403);
  });

  // --- DELETE USER (2 cases) ---

  it('13. Khách hàng không được xóa user -> 403', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${targetUserId}`)
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(403);
  });

  it('14. Admin xóa user thành công', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${targetUserId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });

  // --- LOCK USER (1 case) ---

  it('15. Admin khóa/mở khóa tài khoản thành công', async () => {
    const res = await request(app)
      .patch(`/api/v1/users/${testUserId}/lock`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('lockTime');
  });
});
