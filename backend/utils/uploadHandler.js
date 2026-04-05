let multer = require('multer')
let path = require('path')
let fs = require('fs')

// Đảm bảo thư mục uploads tồn tại
let uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        let newFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, newFileName)
    }
})

let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error('Tệp không đúng định dạng ảnh.'))
    }
}

let filterExel = function (req, file, cb) {
    if (file.mimetype.includes('spreadsheetml') || file.mimetype.includes('excel')) {
        cb(null, true)
    } else {
        cb(new Error('Tệp không đúng định dạng bảng tính.'))
    }
}

module.exports = {
    uploadImage: multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: filterImage
    }),
    uploadExcel: multer({
        storage: storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: filterExel
    })
}
