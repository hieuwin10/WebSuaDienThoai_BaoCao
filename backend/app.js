require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const { seedRoles } = require('./utils/seedData');

const app = express();

app.use(cors());
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// ─── View Engine Setup ────────────────────────────────────────────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi server nội bộ',
  });
});

module.exports = app;
