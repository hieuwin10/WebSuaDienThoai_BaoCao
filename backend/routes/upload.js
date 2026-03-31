var express = require('express');
var router = express.Router();
let { uploadImage } = require('../utils/uploadHandler');
let path = require('path');

// Route để upload một ảnh
router.post('/one_image', uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        res.status(404).send({ message: "file not found" });
    } else {
        res.send({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });
    }
});

// Route để xem ảnh (dùng res.sendFile như thầy)
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename);
    res.sendFile(pathFile);
});

module.exports = router;
