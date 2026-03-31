const repairTicketModel = require('../schemas/repairTickets');
const userModel = require('../schemas/users');
const componentModel = require('../schemas/components');

module.exports = {
  getStats: async () => {
    let tickets = await repairTicketModel.find();
    let users = await userModel.find({ isDeleted: false });
    let components = await componentModel.find();

    let pendingTickets = 0;
    let fixingTickets = 0;
    let completedTickets = 0;
    let revenue = 0;

    for (const ticket of tickets) {
      if (ticket.status === 'pending') {
        pendingTickets += 1;
      }

      if (ticket.status === 'fixing') {
        fixingTickets += 1;
      }

      if (ticket.status === 'completed' || ticket.status === 'ready_for_pickup') {
        completedTickets += 1;
      }

      if (ticket.status === 'completed') {
        revenue += ticket.total_cost || 0;
      }
    }

    let lowStockItems = 0;
    for (const component of components) {
      if (component.stock_quantity < 5) {
        lowStockItems += 1;
      }
    }

    let stats = {
      totalTickets: tickets.length,
      pendingTickets,
      fixingTickets,
      completedTickets,
      totalUsers: users.length,
      lowStockItems,
      revenue
    };

    return stats;
  }
};
