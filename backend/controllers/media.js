const mediaModel = require('../schemas/media');
const fs = require('fs'); // Thư viện thao tác với file hệ thống (giúp xóa file thật)
const path = require('path');

module.exports = {
  // Tạo bản ghi Media mới trong Database
  createMedia: async (data) => {
    return await mediaModel.create(data);
  },

  // Lấy tất cả ảnh, đi kèm thông tin chi tiết của người đã đăng nó
  getAllMedia: async () => {
    return await mediaModel.find()
      .populate('ticket')
      .populate('uploadedBy', 'username fullName');
  },

  // Tìm ảnh dựa trên mã phiếu sửa chữa
  getMediaByTicketId: async (ticketId) => {
    return await mediaModel.find({ ticket: ticketId }).populate('uploadedBy', 'username fullName');
  },

  // Tìm ảnh theo ID cụ thể
  getMediaById: async (id) => {
    return await mediaModel.findById(id);
  },

  /**
   * Xóa ảnh: Xử lý cả trong DB và xóa file thật trên ổ cứng
   */
  deleteMedia: async (id) => {
    let media = await mediaModel.findById(id);
    if (media) {
      // 1. Phép tính ra đường dẫn thực sự trên ổ cứng từ URL của ảnh
      // Ví dụ: /api/v1/upload/123.jpg -> C:\...\uploads\123.jpg
      let filePath = path.join(__dirname, '../uploads', path.basename(media.url));
      
      // 2. Kiểm tra nếu file có tồn tại trên máy chủ thì xóa nó đi bằng fs.unlinkSync
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // 3. Cuối cùng mới xóa thông tin ảnh trong Database
      await mediaModel.findByIdAndDelete(id);
    }
    return media;
  }
};
