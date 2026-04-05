const repairTicketModel = require('../schemas/repairTickets');
const componentModel = require('../schemas/components');
const warrantyModel = require('../schemas/warranty');
const deviceModel = require('../schemas/devices');
const { isStaff: isStaffUser } = require('../utils/roleUtils');

const TICKET_POPULATE = [
  {
    path: 'device_id',
    populate: { path: 'customer_id', select: 'username email fullName' },
  },
  { path: 'services' },
  { path: 'technician_id', select: 'username email fullName' },
  { path: 'components_used.component_id' },
];

function buildTicketQuery(filter) {
  let q = repairTicketModel.find(filter);
  for (const p of TICKET_POPULATE) {
    q = q.populate(p);
  }
  return q;
}

function getDeviceOwnerId(deviceDoc) {
  if (!deviceDoc) return null;
  const c = deviceDoc.customer_id;
  if (!c) return null;
  return c._id ? String(c._id) : String(c);
}

module.exports = {
  /** Khách chỉ xem phiếu gắn thiết bị của chính họ */
  assertUserCanViewTicket(user, ticketDoc) {
    if (!ticketDoc) return false;
    if (isStaffUser(user)) return true;
    const ownerId = getDeviceOwnerId(ticketDoc.device_id);
    return ownerId && ownerId === String(user._id);
  },

  getTicketsForActor: async (user) => {
    if (isStaffUser(user)) {
      return buildTicketQuery({}).exec();
    }
    const deviceIds = await deviceModel.find({ customer_id: user._id }).distinct('_id');
    if (!deviceIds.length) return [];
    return buildTicketQuery({ device_id: { $in: deviceIds } }).exec();
  },
  createTicket: async (data) => {
    let newTicket = new repairTicketModel(data);
    await newTicket.save();
    
    // Adjust Stock
    if (data.components_used && data.components_used.length > 0) {
      for (const item of data.components_used) {
        await componentModel.findByIdAndUpdate(
          item.component_id,
          { $inc: { stock_quantity: -item.quantity } }
        );
      }
    }

    // Auto Create Warranty if completed
    if (data.status === 'completed') {
      let warranty = new warrantyModel({
        ticket: newTicket._id,
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months default
      });
      await warranty.save();
    }

    return newTicket;
  },
  getAllTickets: async () => {
    return buildTicketQuery({}).exec();
  },
  getTicketById: async (id) => {
    let q = repairTicketModel.findOne({ _id: id });
    for (const p of TICKET_POPULATE) {
      q = q.populate(p);
    }
    return q.exec();
  },
  updateTicket: async (id, data) => {
    return await repairTicketModel.findByIdAndUpdate(id, data, { new: true });
  },
  deleteTicket: async (id) => {
    return await repairTicketModel.findByIdAndDelete(id);
  },
  updateStatus: async (id, status) => {
    let ticket = await repairTicketModel.findById(id);
    if (!ticket) return null;

    if (status === 'canceled' && ticket.status !== 'canceled') {
      for (const item of ticket.components_used || []) {
        await componentModel.findByIdAndUpdate(
          item.component_id,
          { $inc: { stock_quantity: item.quantity } }
        );
      }
    }

    ticket.status = status;
    await ticket.save();

    if (status === 'completed') {
      await warrantyModel.findOneAndUpdate(
        { ticket: ticket._id },
        { endDate: new Date(Date.now() + 180*24*60*60*1000) },
        { upsert: true, new: true }
      );
    }
    return ticket;
  },
  cancelTicket: async (id) => {
    const ticket = await repairTicketModel.findById(id);
    if (!ticket) return null;
    if (ticket.status === 'canceled') return ticket;

    for (const item of ticket.components_used || []) {
      await componentModel.findByIdAndUpdate(
        item.component_id,
        { $inc: { stock_quantity: item.quantity } }
      );
    }

    ticket.status = 'canceled';
    await ticket.save();
    return ticket;
  }
};
