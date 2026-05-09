// Trigger CI 2
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { seedRoles } = require('./utils/seedData');

const app = express();

// Chặn CORS bảo mật: Chỉ cho phép domain frontend (mặc định vite là localhost:5173)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// ─── View Engine Setup ────────────────────────────────────────────────────────
// Đã loại bỏ EJS view engine để chuyển hoàn toàn sang RESTful API

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Routes: Account Features ─────────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/components', require('./routes/components'));
app.use('/api/v1/devices', require('./routes/devices'));
app.use('/api/v1/services', require('./routes/services'));
app.use('/api/v1/repair-tickets', require('./routes/repairTickets'));
app.use('/api/v1/media', require('./routes/media'));
app.use('/api/v1/warranty', require('./routes/warranty'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/profiles', require('./routes/profiles'));
app.use('/api/v1/upload', require('./routes/upload'));
// app.use('/', require('./routes/frontend'));

// ─── MongoDB Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('[MongoDB] Kết nối thành công tới:', process.env.MONGO_URI);
    await seedRoles(); // Tự động seed roles mặc định
  })
  .catch((err) => {
    console.error('[MongoDB] Lỗi kết nối:', err.message);
  });

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} không tồn tại` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Dữ liệu đã tồn tại trong hệ thống.' });
  }
  res.status(err.statusCode || err.status || 500).json({
    message: err.message || 'Lỗi server nội bộ',
  });
});

module.exports = app;
