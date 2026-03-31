const componentModel = require('../schemas/components');

module.exports = {
  createComponent: async (data) => {
    return await componentModel.create(data);
  },
  getAllComponents: async () => {
    return await componentModel.find();
  },
  getComponentById: async (id) => {
    return await componentModel.findById(id);
  },
  updateComponent: async (id, data) => {
    return await componentModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteComponent: async (id) => {
    return await componentModel.findByIdAndDelete(id);
  },
  adjustStock: async (id, quantity) => {
    return await componentModel.findByIdAndUpdate(id, { $inc: { stock_quantity: quantity } }, { new: true });
  }
};
