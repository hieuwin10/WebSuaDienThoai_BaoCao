const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const componentModel = require('../schemas/components');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');

describe('Components API Tests (15 Cases)', () => {
  let adminToken = '';
  let userToken = '';
  let componentId = '';

  let adminUser = {
    username: 'admincomp' + Date.now(),
    password: 'AdminPassword123!',
    email: `admincomp${Date.now()}@example.com`
  };

  let normalUser = {
    username: 'usercomp' + Date.now(),
    password: 'UserPassword123!',
    email: `usercomp${Date.now()}@example.com`
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

    // Tạo linh kiện mẫu
    const component = new componentModel({
      name: 'Pin iPhone 11',
      price: 500000,
      stock_quantity: 20,
      sku: 'SKU-PIN11'
    });
    await component.save();
    componentId = component._id;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
    await componentModel.deleteMany({ name: /Pin iPhone/ });
  });

  // --- GET COMPONENTS (3 cases) ---

  it('1. Lấy danh sách linh kiện thành công (Nhân viên/Admin)', async () => {
    const res = await request(app)
      .get('/api/v1/components')
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. Xem chi tiết 1 linh kiện thành công', async () => {
    const res = await request(app)
      .get(`/api/v1/components/${componentId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Pin iPhone 11');
  });

  it('3. Xem linh kiện với ID không tồn tại -> 404', async () => {
    const res = await request(app)
      .get(`/api/v1/components/${new mongoose.Types.ObjectId()}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(404);
  });

  // --- CREATE COMPONENT (4 cases) ---

  it('4. Admin tạo linh kiện mới thành công', async () => {
    const res = await request(app)
      .post('/api/v1/components')
      .set('Cookie', adminToken)
      .send({
        name: 'Pin iPhone 12',
        price: 600000,
        stock_quantity: 15,
        sku: 'SKU-PIN12'
      });
    expect(res.statusCode).toBe(200); // API trả về 200 theo code cũ
    expect(res.body.name).toBe('Pin iPhone 12');
  });

  it('5. Khách hàng không được tạo linh kiện -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/components')
      .set('Cookie', userToken)
      .send({
        name: 'Pin iPhone 12 Hack',
        price: 100000,
        stock_quantity: 100,
        sku: 'SKU-PIN12-HACK'
      });
    expect(res.statusCode).toBe(403);
  });

  it('6. Lỗi khi tạo linh kiện thiếu tên', async () => {
    const res = await request(app)
      .post('/api/v1/components')
      .set('Cookie', adminToken)
      .send({ price: 600000, stock_quantity: 15 });
    expect(res.statusCode).toBe(400);
  });

  it('7. Lỗi khi tạo linh kiện có giá âm', async () => {
    const res = await request(app)
      .post('/api/v1/components')
      .set('Cookie', adminToken)
      .send({ name: 'Pin Lỗi', price: -100, stock_quantity: 15 });
    expect(res.statusCode).toBe(400);
  });

  // --- UPDATE COMPONENT (3 cases) ---

  it('8. Admin cập nhật linh kiện thành công', async () => {
    const res = await request(app)
      .put(`/api/v1/components/${componentId}`)
      .set('Cookie', adminToken)
      .send({ price: 550000 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(550000);
  });

  it('9. Khách hàng không được cập nhật linh kiện -> 403', async () => {
    const res = await request(app)
      .put(`/api/v1/components/${componentId}`)
      .set('Cookie', userToken)
      .send({ price: 100000 });
    expect(res.statusCode).toBe(403);
  });

  it('10. Cập nhật linh kiện không tồn tại -> 404', async () => {
    const res = await request(app)
      .put(`/api/v1/components/${new mongoose.Types.ObjectId()}`)
      .set('Cookie', adminToken)
      .send({ price: 550000 });
    expect(res.statusCode).toBe(404);
  });

  // --- DELETE COMPONENT (2 cases) ---

  it('11. Khách hàng không được xóa linh kiện -> 403', async () => {
    const res = await request(app)
      .delete(`/api/v1/components/${componentId}`)
      .set('Cookie', userToken);
    expect(res.statusCode).toBe(403);
  });

  it('12. Admin xóa linh kiện thành công', async () => {
    const res = await request(app)
      .delete(`/api/v1/components/${componentId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });

  // --- ADJUST STOCK (3 cases) ---

  it('13. API Add-stock: Admin cộng thêm kho thành công', async () => {
    // Tạo lại linh kiện để test
    const comp = new componentModel({ name: 'Pin iPhone 13', price: 700000, stock_quantity: 5, sku: 'SKU-PIN13' });
    await comp.save();

    const res = await request(app)
      .post('/api/v1/components/add-stock')
      .set('Cookie', adminToken)
      .send({ id: comp._id, quantity: 5 });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.stock_quantity).toBe(10); // 5 + 5
    
    await componentModel.findByIdAndDelete(comp._id);
  });

  it('14. API Add-stock: Khách hàng không được dùng -> 403', async () => {
    const res = await request(app)
      .post('/api/v1/components/add-stock')
      .set('Cookie', userToken)
      .send({ id: componentId, quantity: 5 });
    expect(res.statusCode).toBe(403);
  });

  it('15. API Add-stock: Lỗi khi truyền số lượng âm', async () => {
    const res = await request(app)
      .post('/api/v1/components/add-stock')
      .set('Cookie', adminToken)
      .send({ id: componentId, quantity: -5 });
    expect(res.statusCode).toBe(400);
  });
});
