/**
 * Seed dữ liệu demo cho Phone Repair (MongoDB / backend schemas).
 *
 * Cách chạy (từ thư mục backend, đã cấu hình .env MONGO_URI):
 *   npm run seed:demo
 *
 * Xóa toàn bộ dữ liệu các collection liên quan rồi seed lại (CHỈ dùng môi trường dev):
 *   npm run seed:demo:reset
 *
 * Hoặc: node scripts/seed-demo.js [--reset]
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const { seedRoles } = require('../utils/seedData');

const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');
const profileModel = require('../schemas/profiles');
const serviceModel = require('../schemas/services');
const componentModel = require('../schemas/components');
const deviceModel = require('../schemas/devices');
const repairTicketModel = require('../schemas/repairTickets');
const warrantyModel = require('../schemas/warranty');

let mediaModel;
try {
  mediaModel = require('../schemas/media');
} catch {
  mediaModel = null;
}

const RESET = process.argv.includes('--reset') || process.argv.includes('-r');

const SERVICES = [
  { name: 'Thay màn hình cảm ứng', description: 'Thay LCD/cảm ứng nguyên bộ', base_price: 1200000, estimated_time: '90 phút' },
  { name: 'Thay pin', description: 'Pin zin / chính hãng tùy model', base_price: 350000, estimated_time: '45 phút' },
  { name: 'Ép kính', description: 'Ép kính giữ nguyên màn zin', base_price: 450000, estimated_time: '60 phút' },
  { name: 'Vệ sinh máy', description: 'Vệ sinh bo mạch, loa, cổng sạc', base_price: 150000, estimated_time: '30 phút' },
  { name: 'Thay camera sau', description: 'Thay cụm camera sau', base_price: 890000, estimated_time: '50 phút' },
  { name: 'Sửa main / nguồn', description: 'Kiểm tra và sửa lỗi nguồn, IC', base_price: 650000, estimated_time: '120 phút' },
];

const COMPONENTS = [
  { name: 'Màn hình iPhone 13', sku: 'SEED-LCD-IP13', stock_quantity: 12, price: 2800000 },
  { name: 'Màn hình iPhone 14 Pro', sku: 'SEED-LCD-IP14P', stock_quantity: 8, price: 5200000 },
  { name: 'Pin iPhone 12 / 12 Pro', sku: 'SEED-BAT-IP12', stock_quantity: 20, price: 420000 },
  { name: 'Pin Samsung Galaxy S22', sku: 'SEED-BAT-S22', stock_quantity: 15, price: 550000 },
  { name: 'Cụm camera sau iPhone 14', sku: 'SEED-CAM-IP14', stock_quantity: 6, price: 1900000 },
  { name: 'Cổng sạc Type-C (Samsung)', sku: 'SEED-PORT-TYPEC', stock_quantity: 25, price: 280000 },
  { name: 'Kính ép đa năng', sku: 'SEED-GLASS-UNI', stock_quantity: 40, price: 120000 },
  { name: 'IC nguồn PM', sku: 'SEED-IC-PM', stock_quantity: 5, price: 450000 },
];

const DEVICES = [
  { imei: '353456789012341', brand: 'Apple', model_name: 'iPhone 14 Pro', color: 'Titan xanh', condition_on_arrival: 'Nứt kính, cảm ứng loang' },
  { imei: '356789123456789', brand: 'Samsung', model_name: 'Galaxy S22 Ultra', color: 'Đen', condition_on_arrival: 'Hao pin, sập nguồn' },
  { imei: '353499988877661', brand: 'Apple', model_name: 'iPhone 13', color: 'Hồng', condition_on_arrival: 'Bình thường, khách xin vệ sinh' },
  { imei: '354477788899900', brand: 'Xiaomi', model_name: 'Redmi Note 12', color: 'Xanh', condition_on_arrival: 'Màn sọc nhẹ' },
];

const TICKET_CODES = {
  PENDING: 'SEED-DEMO-001',
  FIXING: 'SEED-DEMO-002',
  COMPLETED: 'SEED-DEMO-003',
  READY: 'SEED-DEMO-004',
};

async function clearCollections() {
  const ops = [];
  if (mediaModel) ops.push(mediaModel.deleteMany({}));
  ops.push(
    warrantyModel.deleteMany({}),
    repairTicketModel.deleteMany({}),
    deviceModel.deleteMany({}),
    componentModel.deleteMany({}),
    serviceModel.deleteMany({}),
    profileModel.deleteMany({}),
    userModel.deleteMany({}),
    roleModel.deleteMany({}),
  );
  await Promise.all(ops);
  console.log('[seed-demo] Đã xóa dữ liệu: media (nếu có), warranty, repairTicket, device, component, service, profile, user, role.');
}

async function upsertServices() {
  const docs = [];
  for (const s of SERVICES) {
    const doc = await serviceModel.findOneAndUpdate(
      { name: s.name },
      { $set: s },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    docs.push(doc);
  }
  console.log(`[seed-demo] Dịch vụ: ${docs.length} bản ghi (upsert theo tên).`);
  return docs;
}

async function upsertComponents() {
  const docs = [];
  for (const c of COMPONENTS) {
    const doc = await componentModel.findOneAndUpdate(
      { sku: c.sku },
      { $set: c },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    docs.push(doc);
  }
  console.log(`[seed-demo] Linh kiện: ${docs.length} bản ghi (upsert theo SKU).`);
  return docs;
}

async function ensureCustomer2(userRoleId) {
  let u = await userModel.findOne({ username: 'customer2' });
  if (!u) {
    u = await userModel.create({
      username: 'customer2',
      email: 'customer2@repairsystem.com',
      password: 'password123',
      fullName: 'Phạm Thị Khách',
      role: userRoleId,
    });
    console.log('[seed-demo] Đã tạo user: customer2 / password123');
  }
  return u;
}

async function upsertProfiles(users) {
  const rows = [
    { user: users.admin, full_name: 'Nguyễn Văn Admin', phone: '0901000001', address: 'Quận 1, TP.HCM' },
    { user: users.staff, full_name: 'Trần Văn Staff', phone: '0901000002', address: 'Quận 3, TP.HCM' },
    { user: users.customer1, full_name: 'Lê Văn Khách', phone: '0901000003', address: 'Thủ Đức, TP.HCM' },
    { user: users.customer2, full_name: 'Phạm Thị Khách', phone: '0901000004', address: 'Bình Thạnh, TP.HCM' },
  ];
  for (const r of rows) {
    if (!r.user) continue;
    await profileModel.findOneAndUpdate(
      { user_id: r.user._id },
      {
        user_id: r.user._id,
        full_name: r.full_name,
        phone: r.phone,
        address: r.address,
      },
      { upsert: true, returnDocument: 'after' },
    );
  }
  console.log('[seed-demo] Profile: đã upsert cho admin, staff1, customer1, customer2.');
}

async function upsertDevices(customer1Id, customer2Id) {
  const payloads = [
    { ...DEVICES[0], customer_id: customer1Id },
    { ...DEVICES[1], customer_id: customer1Id },
    { ...DEVICES[2], customer_id: customer2Id },
    { ...DEVICES[3], customer_id: customer2Id },
  ];
  const out = [];
  for (const d of payloads) {
    const doc = await deviceModel.findOneAndUpdate(
      { imei: d.imei },
      {
        $set: {
          customer_id: d.customer_id,
          brand: d.brand,
          model_name: d.model_name,
          imei: d.imei,
          color: d.color,
          condition_on_arrival: d.condition_on_arrival,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    out.push(doc);
  }
  console.log(`[seed-demo] Thiết bị: ${out.length} máy (upsert theo IMEI).`);
  return out;
}

function pickServiceByName(services, namePart) {
  return services.find((s) => s.name.includes(namePart)) || services[0];
}

function pickComponentBySku(components, sku) {
  return components.find((c) => c.sku === sku) || components[0];
}

async function ensureTickets(devices, services, components, staffId) {
  const d0 = devices.find((x) => x.imei === DEVICES[0].imei);
  const d1 = devices.find((x) => x.imei === DEVICES[1].imei);
  const d2 = devices.find((x) => x.imei === DEVICES[2].imei);
  const d3 = devices.find((x) => x.imei === DEVICES[3].imei);

  const svcMan = pickServiceByName(services, 'màn hình');
  const svcPin = pickServiceByName(services, 'pin');
  const svcVeSinh = pickServiceByName(services, 'Vệ sinh');
  const compLcd = pickComponentBySku(components, 'SEED-LCD-IP14P');
  const compBat = pickComponentBySku(components, 'SEED-BAT-S22');

  const specs = [
    {
      ticket_code: TICKET_CODES.PENDING,
      device_id: d0._id,
      services: [svcMan._id],
      components_used: [{ component_id: compLcd._id, quantity: 1 }],
      status: 'pending',
      technician_id: null,
      total_cost: svcMan.base_price + compLcd.price,
      note: 'Khách: Nguyễn A — SĐT: 0912345678\nLỗi: vỡ kính, loang màn.\nGhi chú: chờ xác nhận giá.',
    },
    {
      ticket_code: TICKET_CODES.FIXING,
      device_id: d1._id,
      services: [svcPin._id],
      components_used: [{ component_id: compBat._id, quantity: 1 }],
      status: 'fixing',
      technician_id: staffId,
      total_cost: svcPin.base_price + compBat.price,
      note: 'Đang thay pin — đã báo khách 2–3 giờ lấy máy.',
    },
    {
      ticket_code: TICKET_CODES.COMPLETED,
      device_id: d2._id,
      services: [svcVeSinh._id],
      components_used: [],
      status: 'completed',
      technician_id: staffId,
      total_cost: svcVeSinh.base_price,
      note: 'Vệ sinh hoàn tất, máy chạy ổn định.',
    },
    {
      ticket_code: TICKET_CODES.READY,
      device_id: d3._id,
      services: [pickServiceByName(services, 'Ép kính')._id],
      components_used: [{ component_id: pickComponentBySku(components, 'SEED-GLASS-UNI')._id, quantity: 1 }],
      status: 'ready_for_pickup',
      technician_id: staffId,
      total_cost: pickServiceByName(services, 'Ép kính').base_price + pickComponentBySku(components, 'SEED-GLASS-UNI').price,
      note: 'Ép kính xong — nhắn khách đến nhận máy.',
    },
  ];

  const created = [];
  for (const spec of specs) {
    let t = await repairTicketModel.findOne({ ticket_code: spec.ticket_code });
    if (!t) {
      t = await repairTicketModel.create(spec);
      console.log(`[seed-demo] Đã tạo phiếu: ${spec.ticket_code} (${spec.status})`);
    }
    created.push(t);
  }
  return created;
}

async function ensureWarranties(tickets) {
  const completed = tickets.find((t) => t.ticket_code === TICKET_CODES.COMPLETED);
  if (!completed) return;

  const existing = await warrantyModel.findOne({ ticket: completed._id });
  if (existing) {
    console.log('[seed-demo] Bảo hành: đã tồn tại cho phiếu hoàn thành.');
    return;
  }

  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 6);

  await warrantyModel.create({
    ticket: completed._id,
    startDate: start,
    endDate: end,
    note: 'Bảo hành linh kiện thay thế 6 tháng (không bể, không vào nước).',
  });
  console.log('[seed-demo] Đã tạo bảo hành 6 tháng cho SEED-DEMO-003.');
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('[seed-demo] Thiếu MONGO_URI trong .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('[seed-demo] Đã kết nối MongoDB.');

  if (RESET) {
    await clearCollections();
  }

  await seedRoles();

  const admin = await userModel.findOne({ username: 'admin' });
  const staff = await userModel.findOne({ username: 'staff1' });
  const customer1 = await userModel.findOne({ username: 'customer1' });
  const userRole = await roleModel.findOne({ name: 'USER' });
  if (!userRole) {
    console.error('[seed-demo] Không tìm thấy role USER.');
    process.exit(1);
  }

  const customer2 = await ensureCustomer2(userRole._id);

  await upsertProfiles({
    admin,
    staff,
    customer1,
    customer2,
  });

  const services = await upsertServices();
  const components = await upsertComponents();

  if (!customer1) {
    console.error('[seed-demo] Thiếu customer1 sau seedRoles — kiểm tra seedRoles.');
    process.exit(1);
  }

  const devices = await upsertDevices(customer1._id, customer2._id);
  const tickets = await ensureTickets(devices, services, components, staff?._id || null);
  await ensureWarranties(tickets);

  console.log('\n[seed-demo] Hoàn tất.');
  console.log('Tài khoản mẫu (mật khẩu: password123): admin, staff1, customer1, customer2');
  console.log('IMEI tra cứu bảo hành (thiết bị của customer1/customer2):', DEVICES.map((d) => d.imei).join(', '));
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed-demo] Lỗi:', err);
  process.exit(1);
});
