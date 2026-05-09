const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const serviceModel = require('../schemas/services');
const warrantyModel = require('../schemas/warranty');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');

describe('Services & Warranty API Tests (15 Cases)', () => {
  let adminToken = '';
  let userToken = '';
  let serviceId = '';
  let warrantyId = '';

  let adminUser = {
    username: 'adminsvc' + Date.now(),
    password: 'AdminPassword123!',
    email: `adminsvc${Date.now()}@example.com`
  };

  let normalUser = {
    username: 'usersvc' + Date.now(),
    password: 'UserPassword123!',
    email: `usersvc${Date.now()}@example.com`
  };

  beforeAll(async () => {
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' }, { name: 'ADMIN' }, { upsert: true, returnDocument: 'after' }
    );
    const userRole = await roleModel.findOneAndUpdate(
      { name: 'USER' }, { name: 'USER' }, { upsert: true, returnDocument: 'after' }
    );

    const admin = new userModel({ ...adminUser, role: adminRole._id });
    await admin.save();
    
    const user = new userModel({ ...normalUser, role: userRole._id });
    await user.save();

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      username: adminUser.username, password: adminUser.password
    });
    adminToken = adminLogin.headers['set-cookie'];

    const userLogin = await request(app).post('/api/v1/auth/login').send({
      username: normalUser.username, password: normalUser.password
    });
    userToken = userLogin.headers['set-cookie'];

    // Tạo dịch vụ mẫu
    const service = new serviceModel({
      name: 'Sửa nguồn iPhone',
      base_price: 1000000,
      description: 'Sửa lỗi mất nguồn'
    });
    await service.save();
    serviceId = service._id;

    // Tạo bảo hành mẫu
    const warranty = new warrantyModel({
      ticket: new mongoose.Types.ObjectId(),
      customer_id: user._id,
      duration_months: 6,
      status: 'active',
      endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000)
    });
    await warranty.save();
    warrantyId = warranty._id;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
    await serviceModel.deleteMany({ name: /Sửa nguồn/ });
    await warrantyModel.deleteMany({ duration_months: 6 });
  });

  // --- SERVICES CASES (8 cases) ---

  it('1. Lấy danh sách dịch vụ thành công', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. Xem chi tiết dịch vụ thành công', async () => {
    const res = await request(app).get(`/api/v1/services/${serviceId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Sửa nguồn iPhone');
  });

  it('3. Admin tạo dịch vụ mới thành công', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set('Cookie', adminToken)
      .send({ name: 'Ép kính iPhone', base_price: 500000 });
    expect(res.statusCode).toBe(200);
  });

  it('4. Khách hàng không được tạo dịch vụ -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/services')
      .set('Cookie', userToken)
      .send({ name: 'Hack dịch vụ', base_price: 100 });
    expect(res.statusCode).toBe(403);
  });

  it('5. Admin cập nhật dịch vụ thành công', async () => {
    const res = await request(app)
      .put(`/api/v1/services/${serviceId}`)
      .set('Cookie', adminToken)
      .send({ base_price: 1200000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.base_price).toBe(1200000);
  });

  it('6. Khách hàng không được cập nhật dịch vụ -> 403', async () => {
    const res = await request(app)
      .put(`/api/v1/services/${serviceId}`)
      .set('Cookie', userToken)
      .send({ base_price: 100000 });
    expect(res.statusCode).toBe(403);
  });

  it('7. Admin xóa dịch vụ thành công', async () => {
    const res = await request(app)
      .delete(`/api/v1/services/${serviceId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });

  it('8. Xóa dịch vụ không tồn tại -> 404', async () => {
    const res = await request(app)
      .delete(`/api/v1/services/${serviceId}`) // Xóa lại
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(404);
  });

  // --- WARRANTY CASES (7 cases) ---

  it('9. Admin lấy danh sách bảo hành thành công', async () => {
    const res = await request(app)
      .get('/api/v1/warranty')
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('10. Khách hàng chỉ xem được bảo hành của mình', async () => {
    const res = await request(app)
      .get('/api/v1/warranty')
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(200);
  });

  it('11. Xem chi tiết bảo hành thành công', async () => {
    const res = await request(app)
      .get(`/api/v1/warranty/${warrantyId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });

  it('12. Khách hàng xem bảo hành của người khác -> 403', async () => {
    const otherWarranty = new warrantyModel({
      ticket: new mongoose.Types.ObjectId(),
      duration_months: 12,
      endDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
    });
    await otherWarranty.save();

    const res = await request(app)
      .get(`/api/v1/warranty/${otherWarranty._id}`)
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(403);
    await warrantyModel.findByIdAndDelete(otherWarranty._id);
  });

  it('13. Admin cập nhật bảo hành thành công', async () => {
    const res = await request(app)
      .put(`/api/v1/warranty/${warrantyId}`)
      .set('Cookie', adminToken)
      .send({ status: 'expired' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('expired');
  });

  it('14. Khách hàng không được cập nhật bảo hành -> 403', async () => {
    const res = await request(app)
      .put(`/api/v1/warranty/${warrantyId}`)
      .set('Cookie', userToken)
      .send({ status: 'active' });
    expect(res.statusCode).toBe(403);
  });

  it('15. Admin xóa bảo hành thành công', async () => {
    const res = await request(app)
      .delete(`/api/v1/warranty/${warrantyId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });
});
