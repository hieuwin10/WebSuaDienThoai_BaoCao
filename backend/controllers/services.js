const serviceModel = require('../schemas/services');

module.exports = {
  createService: async (data) => {
    return await serviceModel.create(data);
  },
  getAllServices: async () => {
    return await serviceModel.find();
  },
  getServiceById: async (id) => {
    return await serviceModel.findById(id);
  },
  updateService: async (id, data) => {
    return await serviceModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteService: async (id) => {
    return await serviceModel.findByIdAndDelete(id);
  }
};
