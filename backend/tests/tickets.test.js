const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const repairTicketModel = require('../schemas/repairTickets');
const componentModel = require('../schemas/components');
const deviceModel = require('../schemas/devices');
const userModel = require('../schemas/users');
const roleModel = require('../schemas/roles');
const warrantyModel = require('../schemas/warranty');

describe('Repair Tickets API Tests (25 Cases)', () => {
  let adminToken = '';
  let customerToken = '';
  let customerId = '';
  let deviceId = '';
  let componentId = '';
  let ticketId = '';

  let adminUser = {
    username: 'admin' + Date.now(),
    password: 'AdminPassword123!',
    email: `admin${Date.now()}@example.com`
  };

  let customerUser = {
    username: 'customer' + Date.now(),
    password: 'CustomerPassword123!',
    email: `customer${Date.now()}@example.com`
  };

  beforeAll(async () => {
    // 1. Đảm bảo có các Role cần thiết
    const adminRole = await roleModel.findOneAndUpdate(
      { name: 'ADMIN' }, { name: 'ADMIN' }, { upsert: true, returnDocument: 'after' }
    );
    const userRole = await roleModel.findOneAndUpdate(
      { name: 'USER' }, { name: 'USER' }, { upsert: true, returnDocument: 'after' }
    );

    // 2. Tạo Admin và Customer
    const admin = new userModel({ ...adminUser, role: adminRole._id });
    await admin.save();
    
    const customer = new userModel({ ...customerUser, role: userRole._id });
    await customer.save();
    customerId = customer._id;

    // 3. Đăng nhập để lấy Token
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      username: adminUser.username, password: adminUser.password
    });
    adminToken = adminLogin.headers['set-cookie'];

    const customerLogin = await request(app).post('/api/v1/auth/login').send({
      username: customerUser.username, password: customerUser.password
    });
    customerToken = customerLogin.headers['set-cookie'];

    // 4. Tạo thiết bị mẫu
    const device = new deviceModel({
      name: 'iPhone 13',
      type: 'Phone',
      customer_id: customerId,
      imei: '123456789012345',
      model_name: 'iPhone 13',
      brand: 'Apple'
    });
    await device.save();
    deviceId = device._id;

    // 5. Tạo linh kiện mẫu
    const component = new componentModel({
      name: 'Màn hình iPhone 13',
      price: 2000000,
      stock_quantity: 10,
      sku: 'SKU-PIN13'
    });
    await component.save();
    componentId = component._id;
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: /@example.com/ });
    await deviceModel.deleteMany({ name: 'iPhone 13' });
    await componentModel.deleteMany({ name: 'Màn hình iPhone 13' });
    await repairTicketModel.deleteMany({ device_id: deviceId });
    await warrantyModel.deleteMany({});
  });

  // --- CREATE TICKET CASES (7 cases) ---

  it('1. Admin tạo phiếu sửa chữa thành công', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: deviceId,
        description: 'Thay màn hình',
        components_used: [{ component_id: componentId, quantity: 1 }],
        status: 'pending'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    ticketId = res.body._id;
  });

  it('2. Kiểm tra kho linh kiện bị trừ sau khi tạo phiếu', async () => {
    const comp = await componentModel.findById(componentId);
    expect(comp.stock_quantity).toBe(9); // 10 - 1
  });

  it('3. Lỗi khi tạo phiếu thiếu device_id', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({ description: 'Thiếu device_id' });
    expect(res.statusCode).toBe(400);
  });

  it('4. Khách hàng tạo phiếu cho máy của mình thành công', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', customerToken)
      .send({
        device_id: deviceId,
        description: 'Khách tự tạo phiếu'
      });
    expect(res.statusCode).toBe(201);
  });

  it('5. Khách hàng tạo phiếu cho máy của người khác -> 403', async () => {
    const otherDevice = new deviceModel({ 
      name: 'iPhone 12', 
      type: 'Phone',
      imei: '123456789012346',
      model_name: 'iPhone 12',
      brand: 'Apple',
      customer_id: new mongoose.Types.ObjectId()
    });
    await otherDevice.save();

    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', customerToken)
      .send({
        device_id: otherDevice._id,
        description: 'Mưu đồ tạo phiếu máy người khác'
      });
    expect(res.statusCode).toBe(403);
    await deviceModel.findByIdAndDelete(otherDevice._id);
  });

  it('6. Lỗi khi tạo phiếu với thiết bị không tồn tại', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({ device_id: new mongoose.Types.ObjectId(), description: 'Lỗi' });
    expect(res.statusCode).toBe(400);
  });

  it('7. Lỗi khi số lượng linh kiện trong kho không đủ', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: deviceId,
        components_used: [{ component_id: componentId, quantity: 100 }]
      });
    expect(res.statusCode).toBe(400);
  });

  // --- GET TICKET CASES (5 cases) ---

  it('8. Admin xem được tất cả phiếu', async () => {
    const res = await request(app)
      .get('/api/v1/repair-tickets')
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('9. Khách hàng chỉ xem được phiếu của mình', async () => {
    const res = await request(app)
      .get('/api/v1/repair-tickets')
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(200);
    res.body.forEach(ticket => {
      expect(String(ticket.device_id.customer_id._id || ticket.device_id.customer_id)).toBe(String(customerId));
    });
  });

  it('10. Xem chi tiết phiếu thành công', async () => {
    const res = await request(app)
      .get(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(ticketId);
  });

  it('11. Xem chi tiết phiếu sai ID -> 404', async () => {
    const res = await request(app)
      .get(`/api/v1/repair-tickets/${new mongoose.Types.ObjectId()}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(404);
  });

  it('12. Khách hàng xem phiếu của người khác -> 403', async () => {
    const otherTicket = new repairTicketModel({ 
      description: 'Phiếu khác',
      device_id: new mongoose.Types.ObjectId(),
      ticket_code: 'TC' + Date.now()
    });
    await otherTicket.save();

    const res = await request(app)
      .get(`/api/v1/repair-tickets/${otherTicket._id}`)
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(403);
    await repairTicketModel.findByIdAndDelete(otherTicket._id);
  });

  // --- UPDATE TICKET CASES (5 cases) ---

  it('13. Admin cập nhật phiếu thành công', async () => {
    const res = await request(app)
      .put(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', adminToken)
      .send({ note: 'Cập nhật mô tả' });
    expect(res.statusCode).toBe(200);
    expect(res.body.note).toBe('Cập nhật mô tả');
  });

  it('14. Khách hàng không được quyền PUT cập nhật phiếu -> 403', async () => {
    const res = await request(app)
      .put(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', customerToken)
      .send({ note: 'Khách hack' });
    expect(res.statusCode).toBe(403);
  });

  it('15. Cập nhật trạng thái sang "completed" -> Tự động tạo bảo hành', async () => {
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/status`)
      .set('Cookie', adminToken)
      .send({ status: 'completed' });
    
    expect(res.statusCode).toBe(200);
    const warranty = await warrantyModel.findOne({ ticket: ticketId });
    expect(warranty).toBeTruthy();
  });

  it('16. Hủy phiếu thành công -> Hoàn trả linh kiện', async () => {
    const compBefore = await componentModel.findById(componentId);
    
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/cancel`)
      .set('Cookie', adminToken);
      
    expect(res.statusCode).toBe(200);
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity + 1);
  });

  it('17. Thử hủy lại phiếu đã hủy -> Không lỗi nhưng không cộng thêm kho', async () => {
    const compBefore = await componentModel.findById(componentId);
    
    await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/cancel`)
      .set('Cookie', adminToken);
      
    const compAfter = await componentModel.findById(componentId);
    expect(compAfter.stock_quantity).toBe(compBefore.stock_quantity);
  });

  // --- DELETE TICKET CASES (3 cases) ---

  it('18. Khách hàng không được xóa phiếu -> 403', async () => {
    const res = await request(app)
      .delete(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(403);
  });

  it('19. Admin xóa phiếu thành công', async () => {
    const res = await request(app)
      .delete(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(200);
  });

  it('20. Xóa phiếu không tồn tại -> 404', async () => {
    const res = await request(app)
      .delete(`/api/v1/repair-tickets/${ticketId}`)
      .set('Cookie', adminToken);
    expect(res.statusCode).toBe(404);
  });

  // --- EXTRA CASES (5 cases) ---

  it('21. Lỗi khi tạo phiếu với số lượng linh kiện âm', async () => {
    const res = await request(app)
      .post('/api/v1/repair-tickets')
      .set('Cookie', adminToken)
      .send({
        device_id: deviceId,
        components_used: [{ component_id: componentId, quantity: -1 }]
      });
    expect(res.statusCode).toBe(400);
  });

  it('22. Lỗi khi cập nhật trạng thái không hợp lệ', async () => {
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/status`)
      .set('Cookie', adminToken)
      .send({ status: 'invalid_status' });
    expect(res.statusCode).toBe(400);
  });

  it('23. Nhân viên/Khách không được đổi trạng thái -> 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/status`)
      .set('Cookie', customerToken)
      .send({ status: 'completed' });
    expect(res.statusCode).toBe(403);
  });

  it('24. Khách không được hủy phiếu -> 403', async () => {
    const res = await request(app)
      .patch(`/api/v1/repair-tickets/${ticketId}/cancel`)
      .set('Cookie', customerToken);
    expect(res.statusCode).toBe(403);
  });

  it('25. Xóa phiếu không làm mất thiết bị', async () => {
    const tempTicket = new repairTicketModel({ 
      device_id: deviceId,
      ticket_code: 'TC-TEMP-' + Date.now()
    });
    await tempTicket.save();
    
    await request(app)
      .delete(`/api/v1/repair-tickets/${tempTicket._id}`)
      .set('Cookie', adminToken);
      
    const dev = await deviceModel.findById(deviceId);
    expect(dev).toBeTruthy();
  });
});
