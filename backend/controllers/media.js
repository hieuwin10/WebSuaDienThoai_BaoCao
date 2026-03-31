const mediaModel = require('../schemas/media');
const fs = require('fs');
const path = require('path');

module.exports = {
  createMedia: async (data) => {
    return await mediaModel.create(data);
  },
  getAllMedia: async () => {
    return await mediaModel.find()
      .populate('ticket')
      .populate('uploadedBy', 'username fullName');
  },
  getMediaByTicketId: async (ticketId) => {
    return await mediaModel.find({ ticket: ticketId }).populate('uploadedBy', 'username fullName');
  },
  getMediaById: async (id) => {
    return await mediaModel.findById(id);
  },
  deleteMedia: async (id) => {
    let media = await mediaModel.findById(id);
    if (media) {
      // media.url: /api/v1/upload/123456...jpg
      let filePath = path.join(__dirname, '../uploads', path.basename(media.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await mediaModel.findByIdAndDelete(id);
    }
    return media;
  }
};
