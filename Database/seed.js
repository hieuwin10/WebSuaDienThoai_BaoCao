const mongoose = require('mongoose');
const Role = require('./models/Role');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Device = require('./models/Device');
const Service = require('./models/Service');
const Component = require('./models/Component');
const RepairTicket = require('./models/RepairTicket');
const Media = require('./models/Media');
const Warranty = require('./models/Warranty');

const uri = 'mongodb://admin:password123@localhost:27017/phone_repair_db?authSource=admin';

async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('Đã kết nối tới MongoDB!');

    // 1. Seed Roles (Updated to match backend style)
    const roles = [
      { name: 'ADMIN', description: 'Quản trị viên' },
      { name: 'MODERATOR', description: 'Kiểm duyệt viên' },
      { name: 'USER', description: 'Người dùng thông thường' }
    ];
    for (const r of roles) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true });
    }
    const adminRole = await Role.findOne({ name: 'ADMIN' });
    const userRole = await Role.findOne({ name: 'USER' });

    // 2. Seed User & Profile (Updated to include username and bcrypt)
    // Lưu ý: User model pre-save hook sẽ tự hash password nếu dùng .save() 
    // Nhưng findOneAndUpdate không chạy pre-save hook trừ khi cấu hình đặc biệt.
    // Ở đây ta dùng password thô vì model Database/models/User.js chỉ có pre-save hook cơ bản.
    // Tốt nhất là tạo mới nếu chưa có để trigger hook.
    
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.findOne({ email: 'admin@repairsystem.com' });
    }
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        password: 'password123', // Sẽ được hash bởi hook
        email: 'admin@repairsystem.com',
        fullName: 'Nguyen Van Admin',
        role: adminRole._id
      });
      await adminUser.save();
    } else {
      adminUser.email = adminUser.email || 'admin@repairsystem.com';
      adminUser.fullName = adminUser.fullName || 'Nguyen Van Admin';
      adminUser.role = adminRole._id;
      await adminUser.save();
    }

    await Profile.findOneAndUpdate(
      { user_id: adminUser._id },
      {
        full_name: 'Nguyen Van Admin',
        phone: `ADMIN_${adminUser._id.toString().slice(-8)}`,
        address: 'HCMC'
      },
      { upsert: true }
    );

    let customerUser = await User.findOne({ username: 'customer1' });
    if (!customerUser) {
      customerUser = await User.findOne({ email: 'customer@example.com' });
    }
    if (!customerUser) {
      customerUser = new User({
        username: 'customer1',
        password: 'password123',
        email: 'customer@example.com',
        fullName: 'Customer User',
        role: userRole._id
      });
      await customerUser.save();
    } else {
      customerUser.email = customerUser.email || 'customer@example.com';
      customerUser.fullName = customerUser.fullName || 'Customer User';
      customerUser.role = userRole._id;
      await customerUser.save();
    }

    // 3. Seed Device (Giữ nguyên)
    const device = await Device.findOneAndUpdate(
      { imei: '123456789012345' },
      { customer_id: customerUser._id, brand: 'Apple', model_name: 'iPhone 15 Pro', color: 'Titanium Blue' },
      { upsert: true, returnDocument: 'after' }
    );

    // ... (Phần còn lại giữ nguyên)
    // 4. Seed Service
    const service = await Service.findOneAndUpdate(
      { name: 'Thay màn hình iPhone 15 Pro' },
      { description: 'Thay màn hình zin', base_price: 5000000, estimated_time: '60 phút' },
      { upsert: true, returnDocument: 'after' }
    );

    // 5. Seed Component
    const component = await Component.findOneAndUpdate(
      { sku: 'LCD-IP15P-001' },
      { name: 'Màn hình iPhone 15 Pro', stock_quantity: 10, price: 4000000 },
      { upsert: true, returnDocument: 'after' }
    );

    // 6. Seed RepairTicket
    const ticket = await RepairTicket.findOneAndUpdate(
      { ticket_code: 'REPAIR-2024-001' },
      { 
        device_id: device._id, 
        services: [service._id], 
        components_used: [{ component_id: component._id, quantity: 1 }],
        status: 'pending',
        total_cost: 5000000,
        note: 'Bể màn hình'
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 7. Seed Media
    await Media.findOneAndUpdate(
      { ticket_id: ticket._id, type: 'before' },
      { image_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' },
      { upsert: true }
    );

    // 8. Seed Warranty
    await Warranty.findOneAndUpdate(
      { ticket_id: ticket._id },
      { start_date: new Date(), end_date: new Date(Date.now() + 180*24*60*60*1000), status: 'active' },
      { upsert: true }
    );

    console.log('Đã khởi tạo dữ liệu mẫu thành công!');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi khi seed data:', err);
    process.exit(1);
  }
}

seed();
