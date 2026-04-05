const profileModel = require('../schemas/profiles');
const userModel = require('../schemas/users');

module.exports = {
  getProfileByUserId: async (userId) => {
    const user = await userModel.findById(userId);
    if (!user) return null;

    let profile = await profileModel.findOne({ user_id: userId }).populate('user_id', 'username email fullName role');
    if (!profile) {
      const defaultPhone = `TEMP_${userId.toString().slice(-6)}_${Date.now()}`;
      profile = new profileModel({
        user_id: userId,
        full_name: user.fullName || user.username || 'User',
        phone: defaultPhone,
        address: 'N/A',
      });
      await profile.save();
      profile = await profileModel.findById(profile._id).populate('user_id', 'username email fullName role');
    }
    return profile;
  },
  updateProfileByUserId: async (userId, data) => {
    const user = await userModel.findById(userId);
    if (!user) return null;

    const existed = await profileModel.findOne({ user_id: userId });
    const payload = { ...data };
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
