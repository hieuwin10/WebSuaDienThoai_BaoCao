const profileModel = require('../schemas/profiles');
const userModel = require('../schemas/users');

module.exports = {
  /**
   * Lấy thông tin hồ sơ của người dùng.
   * CƠ CHẾ TỰ ĐỘNG: Nếu người dùng lần đầu vào xem Profile mà chưa có bản ghi,
   * Hệ thống sẽ tự động tạo một Hồ sơ mặc định để tránh lỗi trắng trang ở Frontend.
   */
  getProfileByUserId: async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) return null;

    let profile = await profileModel.findOne({ user_id: userId }).populate('user_id', 'username email fullName role');
    if (!profile) {
      // Logic tạo mã số điện thoại tạm thời để thỏa mãn điều kiện unique
      const defaultPhone = `TEMP_${userId.toString().slice(-6)}_${Date.now()}`;
      profile = new profileModel({
        user_id: userId,
        full_name: user.fullName || user.username || 'User',
        phone: defaultPhone,
        address: 'N/A',
      });
      await profile.save();
      // Sau khi lưu, lấy lại bản ghi kèm theo thông tin User
      profile = await profileModel.findById(profile._id).populate('user_id', 'username email fullName role');
    }
    return profile;
  },

  /**
   * Cập nhật thông tin hồ sơ (Tên, SĐT, Địa chỉ).
   * Dùng tính năng { upsert: true } của Mongoose để Vừa tạo-Vừa sửa.
   */
  updateProfileByUserId: async (userId, data) => {
    const user = await userModel.findById(userId);
    if (!user) return null;

    const existed = await profileModel.findOne({ user_id: userId });
    const payload = { ...data };
    
    // Nếu chưa có hồ sơ, thiết lập các giá trị khởi tạo cần thiết
    if (!existed) {
      payload.user_id = userId;
      payload.full_name = payload.full_name || user.fullName || user.username || 'User';
      payload.phone = payload.phone || `TEMP_${userId.toString().slice(-6)}_${Date.now()}`;
      payload.address = payload.address || 'N/A';
    }

    return await profileModel.findOneAndUpdate(
      { user_id: userId },
      payload,
      { new: true, upsert: true, runValidators: true }
    ).populate('user_id', 'username email fullName role');
  },

  /**
   * Cập nhật ảnh đại diện (Avatar) hoặc ảnh bìa (Cover Image)
   */
  updateProfileImage: async (userId, imageUrl, type) => {
    const user = await userModel.findById(userId);
    if (!user) return null;

    let profile = await profileModel.findOne({ user_id: userId });
    if (!profile) {
      profile = await profileModel.create({
        user_id: userId,
        full_name: user.fullName || user.username || 'User',
        phone: `TEMP_${userId.toString().slice(-6)}_${Date.now()}`,
        address: 'N/A',
      });
    }

    // Kiểm tra loại ảnh muốn cập nhật
    const t = String(type || 'avatar').toLowerCase();
    if (t === 'cover') {
      profile.cover_image = imageUrl;
    } else {
      profile.avatar = imageUrl;
    }
    await profile.save();
    return await profileModel.findById(profile._id).populate('user_id', 'username email fullName role');
  }
};
