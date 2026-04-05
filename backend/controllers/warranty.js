const warrantyModel = require('../schemas/warranty');
const repairTicketModel = require('../schemas/repairTickets');
const deviceModel = require('../schemas/devices');
const { isStaff } = require('../utils/roleUtils');

const TICKET_POPULATE_MIN = {
  path: 'ticket',
  select: 'ticket_code device_id status',
  populate: { path: 'device_id', select: 'customer_id brand model_name imei' },
};

module.exports = {
  createWarranty: async (data) => {
    return await warrantyModel.create(data);
  },
  getAllWarranties: async () => {
    return await warrantyModel.find().populate(TICKET_POPULATE_MIN);
  },
  /** Khách chỉ thấy bảo hành liên quan phiếu của thiết bị mình */
  getWarrantiesForActor: async (user) => {
    if (isStaff(user)) {
      return await warrantyModel.find().populate(TICKET_POPULATE_MIN);
    }
    const deviceIds = await deviceModel.find({ customer_id: user._id }).distinct('_id');
    const ticketIds = await repairTicketModel.find({ device_id: { $in: deviceIds } }).distinct('_id');
    if (!ticketIds.length) return [];
    return await warrantyModel.find({ ticket: { $in: ticketIds } }).populate(TICKET_POPULATE_MIN);
  },
  getWarrantyById: async (id) => {
    return await warrantyModel.findById(id).populate(TICKET_POPULATE_MIN);
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
