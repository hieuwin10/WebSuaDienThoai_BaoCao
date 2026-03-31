const mongoose = require('mongoose');
const categoryModel = require('./schemas/categories');
const productModel = require('./schemas/products');
const inventoryModel = require('./schemas/inventories');
const repairTicketModel = require('./schemas/repairTickets');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Lấy dữ liệu test (Dùng lại từ test trước nếu có)
    const cat = await categoryModel.findOne({ name: 'Dien Thoai Test' });
    const prod = await productModel.findOne({ sku: 'PROD-TEST-001' });
    const invBefore = await inventoryModel.findOne({ product: prod._id });

    console.log('Inventory before repair:', invBefore.quantity);

    // 2. Lập Phiếu Sửa Chữa
    console.log('--- Creating Repair Ticket ---');
    const newTicket = new repairTicketModel({
      ticket_code: `RT-TEST-${Date.now()}`,
      customer_name: 'Khach Hang Test',
      customer_phone: '0901234567',
      device_name: 'Samsung Galaxy Test',
      components_used: [{ component: prod._id, quantity: 1 }],
      total_cost: prod.price + 500000, // Gia linh kien + cong
    });

    // Gia lap logic deduct inventory
    const session = await mongoose.startSession();
    session.startTransaction();
    
    await newTicket.save({ session });
    await inventoryModel.findOneAndUpdate(
      { product: prod._id },
      { $inc: { quantity: -1, sold: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    console.log('Ticket Created:', newTicket.ticket_code);

    // 3. Verify Inventory after
    const invAfter = await inventoryModel.findOne({ product: prod._id });
    console.log('Inventory after repair:', invAfter.quantity);

    if (invAfter.quantity === invBefore.quantity - 1) {
      console.log('SUCCESS: Inventory deducted correctly!');
    } else {
      console.log('ERROR: Inventory not deducted correctly!');
    }

    await mongoose.connection.close();
    console.log('Test completed.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();
