const deviceModel = require('../schemas/devices');
const { isStaff: isStaffUser } = require('../utils/roleUtils');

module.exports = {
  createDevice: async (data) => {
    return await deviceModel.create(data);
  },
  getDevicesForActor: async (user) => {
    if (isStaffUser(user)) {
      return await deviceModel.find().populate('customer_id');
    }
    return await deviceModel.find({ customer_id: user._id }).populate('customer_id');
  },
  getAllDevices: async () => {
    return await deviceModel.find().populate('customer_id');
  },
  getDeviceById: async (id) => {
    return await deviceModel.findById(id).populate('customer_id');
  },
  updateDevice: async (id, data) => {
    return await deviceModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteDevice: async (id) => {
    return await deviceModel.findByIdAndDelete(id);
  }
};
