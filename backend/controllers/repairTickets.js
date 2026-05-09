const mongoose = require('mongoose');
const repairTicketModel = require('../schemas/repairTickets');
const componentModel = require('../schemas/components');
const warrantyModel = require('../schemas/warranty');
const deviceModel = require('../schemas/devices');
const { isStaff: isStaffUser } = require('../utils/roleUtils');

// Cấu hình Populate để tự động lấy thông tin từ các bảng liên quan 
// (Thiết bị, Khách hàng, Dịch vụ, Kỹ thuật viên, Linh kiện)
const TICKET_POPULATE = [
  {
    path: 'device_id',
    populate: { path: 'customer_id', select: 'username email fullName' },
  },
  { path: 'services' },
  { path: 'technician_id', select: 'username email fullName' },
  { path: 'components_used.component_id' },
];

// Hàm bổ trợ để thực hiện Populate hàng loạt cho một query
function buildTicketQuery(filter) {
  let q = repairTicketModel.find(filter);
  for (const p of TICKET_POPULATE) {
    q = q.populate(p);
  }
  return q;
}

// Lấy ID người sở hữu thiết bị để kiểm tra quyền
function getDeviceOwnerId(deviceDoc) {
  if (!deviceDoc) return null;
  const c = deviceDoc.customer_id;
  if (!c) return null;
  return c._id ? String(c._id) : String(c);
}

module.exports = {
  /**
   * Kiểm tra xem người dùng hiện tại có quyền xem phiếu sửa chữa này không.
   * Nhân viên xem hết, khách chỉ xem phiếu thuộc thiết bị của mình.
   */
  assertUserCanViewTicket(user, ticketDoc) {
    if (isStaffUser(user)) return true;
    if (!ticketDoc) return false;
    const ownerId = getDeviceOwnerId(ticketDoc.device_id);
    return ownerId && ownerId === String(user._id);
  },

  // Lấy toàn bộ phiếu sửa chữa (Nếu là khách hàng thì chỉ lấy phiếu của họ)
  getTicketsForActor: async (user) => {
    if (isStaffUser(user)) {
      return buildTicketQuery({}).exec();
    }
    // Tìm các ID thiết bị mà khách hàng này đang sở hữu
    const deviceIds = await deviceModel.find({ customer_id: user._id }).distinct('_id');
    if (!deviceIds.length) return [];
    // Chỉ trả về các phiếu gắn với các thiết bị đó
    return buildTicketQuery({ device_id: { $in: deviceIds } }).exec();
  },

  /**
   * Tạo phiếu sửa chữa mới: Xử lý cả trừ kho và tự động tạo bảo hành
   */
  createTicket: async (data) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let newTicket = new repairTicketModel(data);
      await newTicket.save({ session });
      
      // 1. Tự động trừ số lượng linh kiện trong kho khi có linh kiện được sử dụng
      if (data.components_used && data.components_used.length > 0) {
        for (const item of data.components_used) {
          const updatedComponent = await componentModel.findOneAndUpdate(
            { _id: item.component_id, stock_quantity: { $gte: item.quantity } },
            { $inc: { stock_quantity: -item.quantity } },
            { session, new: true }
          );
          if (!updatedComponent) {
            const err = new Error('Số lượng linh kiện trong kho không đủ');
            err.status = 400;
            throw err;
          }
        }
      }

      // 2. Nếu trạng thái phiếu là 'completed' (Hoàn thành) thì tự động tạo phiếu bảo hành 6 tháng
      if (data.status === 'completed') {
        let warranty = new warrantyModel({
          ticket: newTicket._id,
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // Mặc định 6 tháng
        });
        await warranty.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return newTicket;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  // Lấy danh sách tất cả phiếu đang tồn tại
  getAllTickets: async () => {
    return buildTicketQuery({}).exec();
  },

  // Lấy chi tiết một phiếu sửa chữa theo ID
  getTicketById: async (id) => {
    let q = repairTicketModel.findOne({ _id: id });
    for (const p of TICKET_POPULATE) {
      q = q.populate(p);
    }
    return q.exec();
  },

  // Cập nhật thông tin phiếu sửa chữa
  updateTicket: async (id, data) => {
    return await repairTicketModel.findByIdAndUpdate(id, data, { new: true });
  },

  // Xóa phiếu sửa chữa
  deleteTicket: async (id) => {
    return await repairTicketModel.findByIdAndDelete(id);
  },

  /**
   * Cập nhật trạng thái phiếu (ví dụ: Chuyển từ Đang sửa sang Hoàn thành)
   */
  updateStatus: async (id, status) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      let ticket = await repairTicketModel.findById(id).session(session);
      if (!ticket) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }

      // Nếu phiếu bị hủy (canceled), hãy cộng lại số lượng linh kiện vào kho
      if (status === 'canceled' && ticket.status !== 'canceled') {
        for (const item of ticket.components_used || []) {
          await componentModel.findByIdAndUpdate(
            item.component_id,
            { $inc: { stock_quantity: item.quantity } },
            { session }
          );
        }
      }

      ticket.status = status;
      await ticket.save({ session });

      // Nếu trạng thái chuyển sang 'completed', hãy tạo/cập nhật thông tin bảo hành
      if (status === 'completed') {
        await warrantyModel.findOneAndUpdate(
          { ticket: ticket._id },
          { endDate: new Date(Date.now() + 180*24*60*60*1000) },
          { upsert: true, new: true, session }
        );
      }

      await session.commitTransaction();
      session.endSession();
      return ticket;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  },

  // Hàm chuyên biệt để hủy phiếu và hoàn trả linh kiện vào kho
  cancelTicket: async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const ticket = await repairTicketModel.findById(id).session(session);
      if (!ticket) {
        await session.abortTransaction();
        session.endSession();
        return null;
      }
      if (ticket.status === 'canceled') {
        await session.abortTransaction();
        session.endSession();
        return ticket;
      }

      // Hoàn trả số lượng các linh kiện đã định lấy ra cho phiếu này về kho
      for (const item of ticket.components_used || []) {
        await componentModel.findByIdAndUpdate(
          item.component_id,
          { $inc: { stock_quantity: item.quantity } },
          { session }
        );
      }

      ticket.status = 'canceled';
      await ticket.save({ session });

      await session.commitTransaction();
      session.endSession();
      return ticket;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
};
