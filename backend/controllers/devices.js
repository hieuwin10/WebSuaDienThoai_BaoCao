const deviceModel = require('../schemas/devices');

module.exports = {
  createDevice: async (data) => {
    return await deviceModel.create(data);
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
