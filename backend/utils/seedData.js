const roleModel = require('../schemas/roles');
const userModel = require('../schemas/users');

const seedRoles = async () => {
  try {
    const defaultRoles = [
      { name: 'ADMIN', description: 'Quan tri vien' },
      { name: 'MODERATOR', description: 'Kiem duyet vien (Nhan vien)' },
      { name: 'USER', description: 'Nguoi dung thong thuong (Khach hang)' },
    ];

    for (const roleData of defaultRoles) {
      await roleModel.findOneAndUpdate({ name: roleData.name }, roleData, { upsert: true });
    }
    console.log('[Seed] Seed roles hoan tat.');

    const adminRole = await roleModel.findOne({ name: 'ADMIN' });
    const modRole = await roleModel.findOne({ name: 'MODERATOR' });
    const userRole = await roleModel.findOne({ name: 'USER' });

    if (!adminRole || !modRole || !userRole) {
      console.error('[Seed] Khong tim thay day du role de tao user');
      return;
    }

    const defaultUsers = [
      { username: 'admin', email: 'admin@repairsystem.com', password: 'password123', fullName: 'Nguyen Van Admin', role: adminRole._id },
      { username: 'staff1', email: 'staff@repairsystem.com', password: 'password123', fullName: 'Tran Van Staff', role: modRole._id },
      { username: 'customer1', email: 'customer@repairsystem.com', password: 'password123', fullName: 'Le Van Khach', role: userRole._id },
    ];

    for (const userData of defaultUsers) {
      const existing = await userModel.findOne({ username: userData.username });
      if (!existing) {
        await userModel.create(userData);
        console.log(`[Seed] Da tao user: ${userData.username}`);
      }
    }
    console.log('[Seed] Seed users hoan tat.');
  } catch (err) {
    console.error('[Seed] Loi khi seed:', err.message);
  }
};

module.exports = { seedRoles };
