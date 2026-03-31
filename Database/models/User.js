const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username là bắt buộc'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password là bắt buộc'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: 'https://i.sstatic.net/l60Hf.png',
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role là bắt buộc'],
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lockTime: {
      type: Date,
      default: null,
    },
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordTokenExp: { type: Date, default: null },
  },
  { timestamps: true }
);

// Pre-save hook: auto hash password
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

module.exports = mongoose.model('User', userSchema);
