const warrantyModel = require('../schemas/warranty');

module.exports = {
  createWarranty: async (data) => {
    return await warrantyModel.create(data);
  },
  getAllWarranties: async () => {
    return await warrantyModel.find().populate({
        path: 'ticket',
        select: 'ticket_code device_id status'
    });
  },
  getWarrantyById: async (id) => {
    return await warrantyModel.findById(id).populate('ticket');
  },
  updateWarranty: async (id, data) => {
    return await warrantyModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteWarranty: async (id) => {
    return await warrantyModel.findByIdAndDelete(id);
  },
  searchByTicket: async (ticketIds) => {
    return await warrantyModel.find({ ticket: { $in: ticketIds } }).populate('ticket');
  }
};
