const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');

describe('Auth API Tests (20 Cases)', () => {
  let testUser = {
    username: 'testuser' + Math.floor(Math.random() * 1000000),
    password: 'TestPassword123!',
    email: `test${Date.now()}@example.com`,
    fullName: 'Test User'
  };

  let cookie = '';

  beforeAll(async () => {
    // Đảm bảo có role USER
    await roleModel.findOneAndUpdate(
      { name: 'USER' },
      { name: 'USER' },
      { upsert: true, returnDocument: 'after' }
    );
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
  });

  // --- REGISTER CASES ---
  
  it('1. Đăng ký thành công với dữ liệu hợp lệ', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', testUser.username);
  });

  it('2. Lỗi khi thiếu username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, username: '', email: `test2${Date.now()}@example.com` });
    expect(res.statusCode).toBe(400);
  });

  it('3. Lỗi khi thiếu email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: '', username: 'testuser2' });
    expect(res.statusCode).toBe(400);
  });

  it('4. Lỗi khi thiếu password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, password: '', username: 'testuser3' });
    expect(res.statusCode).toBe(400);
  });

  it('5. Lỗi khi email sai định dạng', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: 'invalid-email', username: 'testuser4' });
    expect(res.statusCode).toBe(400);
  });

  it('6. Lỗi khi trùng username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, email: `test3${Date.now()}@example.com` });
    expect(res.statusCode).toBe(400);
  });

  it('7. Lỗi khi trùng email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, username: 'testuser5' });
    expect(res.statusCode).toBe(400);
  });

  // --- LOGIN CASES ---

  it('8. Đăng nhập thành công, trả về JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
    cookie = res.headers['set-cookie'];
  });

  it('9. Thất bại khi sai mật khẩu', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: testUser.username,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
  });

  it('10. Thất bại khi sai username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'nonexistentuser',
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(401);
  });

  // --- AUTH STATE CASES ---

  it('11. Lấy thông tin user hiện tại (/me)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.username).toBe(testUser.username);
  });

  it('12. Truy cập /me không có token -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('13. Truy cập /me với token không hợp lệ -> 401', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', ['AUTH_TOKEN=invalidtoken']);
    expect(res.statusCode).toBe(401);
  });

  // --- PASSWORD CHANGE ---

  it('14. Đổi mật khẩu thành công', async () => {
    const res = await request(app)
      .post('/api/v1/auth/changepassword')
      .set('Cookie', cookie)
      .send({
        oldpassword: testUser.password,
        newpassword: 'NewPassword123!'
      });
    expect(res.statusCode).toBe(200);
    
    // Cập nhật lại mật khẩu cho các test sau
    testUser.password = 'NewPassword123!';
  });

  it('15. Đổi mật khẩu thất bại khi sai mật khẩu cũ', async () => {
    const res = await request(app)
      .post('/api/v1/auth/changepassword')
      .set('Cookie', cookie)
      .send({
        oldpassword: 'wrongpassword',
        newpassword: 'AnotherPassword123!'
      });
    expect(res.statusCode).toBe(400);
  });

  // --- FORGOT & RESET PASSWORD ---

  it('16. Yêu cầu reset pass thành công (tạo token)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgotpassword')
      .send({ email: testUser.email });
    expect(res.statusCode).toBe(200);
  });

  it('17. Reset pass thất bại với email không tồn tại', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgotpassword')
      .send({ email: 'nonexistent@example.com' });
    expect(res.statusCode).toBe(404);
  });

  it('18. Reset mật khẩu thành công với token hợp lệ', async () => {
    // Lấy token từ DB
    const user = await userModel.findOne({ email: testUser.email });
    const token = user.forgotPasswordToken;
    
    const res = await request(app)
      .post(`/api/v1/auth/resetpassword/${token}`)
      .send({ newpassword: 'ResetPassword123!' });
      
    expect(res.statusCode).toBe(200);
    testUser.password = 'ResetPassword123!';
  });

  it('19. Reset mật khẩu thất bại với token không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/v1/auth/resetpassword/invalidtoken')
      .send({ newpassword: 'ResetPassword123!' });
    expect(res.statusCode).toBe(400);
  });

  // --- LOGOUT ---

  it('20. Đăng xuất thành công', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie);
    expect(res.statusCode).toBe(200);
  });
});
