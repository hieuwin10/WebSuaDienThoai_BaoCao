const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');
const componentModel = require('../schemas/components');
const serviceModel = require('../schemas/services');
const deviceModel = require('../schemas/devices');
const repairTicketModel = require('../schemas/repairTickets');
const warrantyModel = require('../schemas/warranty');

async function seed() {
  try {
    console.log('--- CLEAN & SEED (MANUAL HASH) ---');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[1/7] Connected to DB.');

    await Promise.all([
      userModel.deleteMany({}),
      roleModel.deleteMany({}),
      componentModel.deleteMany({}),
      serviceModel.deleteMany({}),
      deviceModel.deleteMany({}),
      repairTicketModel.deleteMany({}),
      warrantyModel.deleteMany({})
    ]);
    console.log('Database cleared.');

    const adminRole = await roleModel.create({ name: 'ADMIN', description: 'Quản trị viên' });
    const modRole = await roleModel.create({ name: 'MODERATOR', description: 'Kỹ thuật viên' });
    const userRole = await roleModel.create({ name: 'USER', description: 'Khách hàng' });
    console.log('[2/7] Roles created.');

    const salt = bcrypt.genSaltSync(10);
    const usersData = [
      { username: 'admin', email: 'admin@phonerepair.com', password: bcrypt.hashSync('password123', salt), fullName: 'Admin', role: adminRole._id },
      { username: 'tech1', email: 'tech1@phonerepair.com', password: bcrypt.hashSync('password123', salt), fullName: 'Tech 1', role: modRole._id },
      { username: 'tech2', email: 'tech2@phonerepair.com', password: bcrypt.hashSync('password123', salt), fullName: 'Tech 2', role: modRole._id },
      { username: 'customer1', email: 'cus1@gmail.com', password: bcrypt.hashSync('password123', salt), fullName: 'Customer 1', role: userRole._id },
    ];

    const createdUsers = await userModel.create(usersData);
    const tech1 = createdUsers.find(u => u.username === 'tech1');
    const cus1 = createdUsers.find(u => u.username === 'customer1');
    console.log('[3/7] Users created (Manual Hash).');

    const createdComps = await componentModel.create([
      { name: 'Màn hình iPhone 13 PM', sku: 'SCR-IP13PM', stock_quantity: 10, price: 4500000 },
      { name: 'Pin Samsung S22U', sku: 'BAT-S22U', stock_quantity: 15, price: 850000 },
    ]);
    console.log('[4/7] Components created.');

    const createdSvcs = await serviceModel.create([
      { name: 'Thay màn hình', base_price: 500000, estimated_time: '60 phút' },
      { name: 'Thay pin', base_price: 200000, estimated_time: '30 phút' },
    ]);
    console.log('[5/7] Services created.');

    const device = await deviceModel.create({ 
      customer_id: cus1._id, brand: 'Apple', model_name: 'iPhone 13 PM', imei: 'IMEI123', color: 'Gold', condition_on_arrival: 'Vỡ màn hình'
    });
    console.log('[6/7] Device created.');

    const ticket = await repairTicketModel.create({
      ticket_code: 'RT-001',
      device_id: device._id,
      services: [createdSvcs[0]._id],
      components_used: [{ component_id: createdComps[0]._id, quantity: 1 }],
      status: 'completed',
      total_cost: 5000000,
      technician_id: tech1._id,
      note: 'Xong.'
    });
    await warrantyModel.create({
      ticket: ticket._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 180*24*60*60*1000),
      note: 'Bao hanh 6 thang'
    });
    console.log('[7/7] Ticket/Warranty created.');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('SEED ERROR:', err);
    process.exit(1);
  }
}
seed();
