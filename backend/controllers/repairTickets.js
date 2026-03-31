const repairTicketModel = require('../schemas/repairTickets');
const componentModel = require('../schemas/components');
const warrantyModel = require('../schemas/warranty');
const mongoose = require('mongoose');

module.exports = {
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
    return await repairTicketModel.find()
      .populate('device_id')
      .populate('services')
      .populate('technician_id', 'username email fullName')
      .populate('components_used.component_id');
  },
  getTicketById: async (id) => {
    return await repairTicketModel.findById(id)
      .populate('device_id')
      .populate('services')
      .populate('technician_id', 'username email fullName')
      .populate('components_used.component_id');
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
