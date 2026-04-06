const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');

/**
 * Seed các quyền cơ bản và tài khoản quản trị hệ thống nếu chưa tồn tại.
 * Được gọi tự động khi Server (app.js) khởi động hoặc khi chạy lệnh seed:demo.
 */
async function seedRoles() {
  try {
    // 1. Kiểm tra và tạo 3 quyền mặc định (Mục tiêu: Đảm bảo role_id không bị trống)
    const roles = [
      { name: 'ADMIN', description: 'Quản trị viên toàn quyền hệ thống' },
      { name: 'MODERATOR', description: 'Nhân viên kỹ thuật / Điều phối viên' },
      { name: 'USER', description: 'Khách hàng sử dụng dịch vụ' },
    ];

    for (const r of roles) {
      // Upsert: Nếu có tên quyền rồi thì bỏ qua, nếu chưa có thì tạo mới
      await roleModel.findOneAndUpdate(
        { name: r.name },
        { $setOnInsert: r },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // 2. Lấy ID của các quyền vừa tạo để gắn cho User
    const adminRole = await roleModel.findOne({ name: 'ADMIN' });
    const staffRole = await roleModel.findOne({ name: 'MODERATOR' });
    const userRole = await roleModel.findOne({ name: 'USER' });

    // 3. Kiểm tra và tạo tài khoản Admin mặc định (Phục vụ việc đăng nhập lần đầu)
    const adminExists = await userModel.findOne({ username: 'admin' });
    if (!adminExists && adminRole) {
      await userModel.create({
        username: 'admin',
        password: 'password123', // Hook pre-save trong users.js sẽ tự mã hóa mật khẩu này
        email: 'admin@repairsystem.com',
        fullName: 'Nguyễn Văn Admin',
        role: adminRole._id
      });
      console.log('[Seed] Đã tạo tài khoản Admin mặc định: admin / password123');
    }

    // 4. Tạo thêm tài khoản Staff/Kỹ thuật mẫu
    const staffExists = await userModel.findOne({ username: 'staff1' });
    if (!staffExists && staffRole) {
      await userModel.create({
        username: 'staff1',
        password: 'password123',
        email: 'staff1@repairsystem.com',
        fullName: 'Trần Văn Staff',
        role: staffRole._id
      });
      console.log('[Seed] Đã tạo tài khoản Staff mặc định: staff1 / password123');
    }

    // 5. Tạo thêm tài khoản Khách hàng mẫu
    const customerExists = await userModel.findOne({ username: 'customer1' });
    if (!customerExists && userRole) {
      await userModel.create({
        username: 'customer1',
        password: 'password123',
        email: 'customer1@repairsystem.com',
        fullName: 'Lê Văn Khách',
        role: userRole._id
      });
      console.log('[Seed] Đã tạo tài khoản Khách hàng mẫu: customer1 / password123');
    }

  } catch (error) {
    console.error('[Seed Error] Lỗi khi khởi tạo dữ liệu mặc định:', error.message);
  }
}

module.exports = {
  seedRoles
};
