const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      ref: 'role',
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

userSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return;
  }
  this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
});

userSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate() || {};
  const password = update.password || (update.$set && update.$set.password);
  if (!password) {
    return;
  }
  if (typeof password === "string" && password.startsWith("$2")) {
    return;
  }
  const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
  if (update.password) {
    update.password = hashed;
  } else {
    update.$set.password = hashed;
  }
  this.setUpdate(update);
});

module.exports = mongoose.model('user', userSchema);
