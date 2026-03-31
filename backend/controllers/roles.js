const roleModel = require('../schemas/roles');

module.exports = {
  createRole: async (data) => {
    return await roleModel.create(data);
  },
  getAllRoles: async () => {
    return await roleModel.find({ isDeleted: false });
  },
  getRoleById: async (id) => {
    return await roleModel.findOne({ _id: id, isDeleted: false });
  },
  updateRole: async (id, data) => {
    return await roleModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteRole: async (id) => {
    return await roleModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
};
