const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const repairTicketModel = require('../schemas/repairTickets');
const componentModel = require('../schemas/components');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');

describe('Data Integrity & Transaction Tests (10 Cases)', () => {
  let adminToken = '';
  let componentId = '';

  beforeAll(async () => {
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' }, { name: 'ADMIN' }, { upsert: true, returnDocument: 'after' }
    );

    const admin = new userModel({
      username: 'admintran' + Date.now(),
      password: 'AdminPassword123!',
      email: `admintran${Date.now()}@example.com`,
      role: adminRole._id
    });
    await admin.save();

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      username: admin.username, password: 'AdminPassword123!'
    });
    adminToken = adminLogin.headers['set-cookie'];

    const component = new componentModel({
      name: 'Màn hình Test Tran',
      price: 1000000,
      stock_quantity: 5,
      sku: 'SKU-TRAN1'
    });
    await component.save();
    componentId = component._id;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
    await componentModel.deleteMany({ name: /Màn hình Test Tran/ });
    await repairTicketModel.deleteMany({});
  });

  it('1. Tạo phiếu lỗi (thiếu trường) -> Kho không bị trừ', async () => {
    const compBefore = await componentModel.findById(componentId);
    
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        description: 'Lỗi thiếu device_id',
        components_used: [{ component_id: componentId, quantity: 1 }]
      });
      
    expect(res.statusCode).toBe(400);
    
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity);
  });

  it('2. Tạo phiếu với số lượng vượt quá kho -> Kho không đổi', async () => {
    const compBefore = await componentModel.findById(componentId);
    
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: new mongoose.Types.ObjectId(),
        description: 'Lỗi vượt quá kho',
        components_used: [{ component_id: componentId, quantity: 100 }]
      });
      
    expect(res.statusCode).toBe(400);
    
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity);
  });

  it('3. Hủy phiếu thành công -> Kho được hoàn trả', async () => {
    const ticket = new repairTicketModel({
      device_id: new mongoose.Types.ObjectId(),
      components_used: [{ component_id: componentId, quantity: 1 }],
      ticket_code: 'TC' + Date.now()
    });
    await ticket.save();
    
    await componentModel.findByIdAndUpdate(componentId, { $inc: { stock_quantity: -1 } });
    
    const compBefore = await componentModel.findById(componentId);
    
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticket._id}/cancel`)
      .set('Cookie', adminToken);
      
    expect(res.statusCode).toBe(200);
    
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity + 1);
  });

  it('4. Hủy phiếu thất bại (ID sai) -> Kho không đổi', async () => {
    const compBefore = await componentModel.findById(componentId);
    
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${new mongoose.Types.ObjectId()}/cancel`)
      .set('Cookie', adminToken);
      
    expect(res.statusCode).toBe(404);
    
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity);
  });

  it('5. Hoàn thành phiếu -> Tạo bảo hành (Tính nguyên tử)', async () => {
    const ticket = new repairTicketModel({ 
      device_id: new mongoose.Types.ObjectId(),
      ticket_code: 'TC' + Date.now()
    });
    await ticket.save();
    
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticket._id}/status`)
      .set('Cookie', adminToken)
      .send({ status: 'completed' });
      
    expect(res.statusCode).toBe(200);
    
    const warranty = await mongoose.model('warranty').findOne({ ticket: ticket._id });
    expect(warranty).toBeTruthy();
  });

  it('6. Cập nhật trạng thái lỗi -> Không tạo bảo hành', async () => {
    const ticket = new repairTicketModel({ 
      device_id: new mongoose.Types.ObjectId(),
      ticket_code: 'TC' + Date.now()
    });
    await ticket.save();
    
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticket._id}/status`)
      .set('Cookie', adminToken)
      .send({ status: 'invalid_status' });
      
    expect(res.statusCode).toBe(400);
    
    const warranty = await mongoose.model('warranty').findOne({ ticket: ticket._id });
    expect(warranty).toBeFalsy();
  });

  it('7. Lỗi khi tạo phiếu với linh kiện không có ID', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: new mongoose.Types.ObjectId(),
        components_used: [{ quantity: 1 }]
      });
    expect(res.statusCode).toBe(400);
  });

  it('8. Lỗi khi tạo phiếu với linh kiện có số lượng bằng 0', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: new mongoose.Types.ObjectId(),
        components_used: [{ component_id: componentId, quantity: 0 }]
      });
    expect(res.statusCode).toBe(400);
  });

  it('9. Lỗi khi tạo phiếu với linh kiện không tồn tại trong DB', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: new mongoose.Types.ObjectId(),
        components_used: [{ component_id: new mongoose.Types.ObjectId(), quantity: 1 }]
      });
    expect(res.statusCode).toBe(400);
  });

  it('10. Kiểm tra tính nhất quán: Xóa linh kiện đang được dùng trong phiếu', async () => {
    const ticket = new repairTicketModel({
      device_id: new mongoose.Types.ObjectId(),
      components_used: [{ component_id: componentId, quantity: 1 }],
      ticket_code: 'TC' + Date.now()
    });
    await ticket.save();
    
    const res = await request(app)
      .delete(`/api/v1/components/${componentId}`)
      .set('Cookie', adminToken);
      
    expect(res.statusCode).toBe(200);
    
    const t = await repairTicketModel.findById(ticket._id);
    expect(t.components_used[0].component_id).toBeTruthy();
  });
});
