let userModel = require("../schemas/users");
let bcrypt = require('bcryptjs')
let jwt = require('jsonwebtoken')

module.exports = {
    // Tạo một người dùng mới (được gọi từ file auth.js hoặc admin quản lý user)
    CreateAnUser: async function (username, password, email, role, session, fullName, avatarUrl, status, loginCount) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });
        if (session) {
            await newItem.save({ session });
        } else {
            await newItem.save();
        }
        return newItem;
    },

    // Lấy toàn bộ danh sách người dùng (Chỉ Admin/Mod mới được phép gọi)
    GetAllUser: async function () {
        return await userModel
            .find({ isDeleted: false })
            .populate('role') // Gộp thông tin quyền hạn vào
    },

    // Tìm một người dùng cụ thể bằng ID
    GetUserById: async function (id) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    _id: id
                })
                .populate('role')
        } catch (error) {
            return false;
        }
    },

    // Tìm người dùng bằng Email (Thường dùng để kiểm tra trùng lặp)
    GetUserByEmail: async function (email) {
        try {
            return await userModel
                .findOne({
                    isDeleted: false,
                    email: email
                })
        } catch (error) {
            return false;
        }
    },

    // Tìm người dùng bằng Token (Dùng trong tính năng Đổi mật khẩu)
    GetUserByToken: async function (token) {
        try {
            let user = await userModel
                .findOne({
                    isDeleted: false,
                    forgotPasswordToken: token
                })
            if (user && user.forgotPasswordTokenExp > Date.now()) {
                return user;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    /**
     * Hàm quan trọng: Xử lý Đăng nhập của người dùng
     */
    QueryLogin: async function (username, password) {
        if (!username || !password) {
            return false;
        }
        // 1. Tìm người dùng theo username
        let user = await userModel.findOne({
            username: username,
            isDeleted: false
        })
        
        if (user) {
            // 2. Kiểm tra xem tài khoản có đang bị khóa (lockTime) hay không
            if (user.lockTime && user.lockTime > Date.now()) {
                return false;
            } else {
                // 3. So sánh mật khẩu bằng bcrypt
                if (bcrypt.compareSync(password, user.password)) {
                    // Đăng nhập đúng: Reset số lần sai về 0
                    user.loginCount = 0;
                    await user.save();
                    
                    // Tạo Token (JWT) để gửi về Frontend (Vé thông hành)
                    let token = jwt.sign({
                        id: user.id
                    }, process.env.JWT_SECRET || 'secret', {
                        expiresIn: '1d' // Token có hạn trong 1 ngày
                    })
                    return token;
                } else {
                    // Đăng nhập sai: Tăng số lần sai
                    user.loginCount++;
                    // Nếu sai 3 lần liên tiếp: Khóa tài khoản trong 1 tiếng (3,600,000 ms)
                    if (user.loginCount == 3) {
                        user.loginCount = 0;
                        user.lockTime = Date.now() + 3_600_000;
                    }
                    await user.save();
                    return false;
                }
            }
        } else {
            return false;
        }
    },

    // Thay đổi mật khẩu người dùng
    ChangePassword: async function (user, oldPassword, newPassword) {
        if (bcrypt.compareSync(oldPassword, user.password)) {
            user.password = newPassword; // Gán mới, hook pre-save sẽ tự hash
            await user.save();
            return true;
        } else {
            return false;
        }
    },

    // Cập nhật thông tin (Tên, Email, Role...)
    UpdateUser: async function (id, data) {
        return await userModel.findByIdAndUpdate(id, data, { new: true });
    },

    // Xóa người dùng (Xóa mềm bằng isDeleted)
    DeleteUser: async function (id) {
        return await userModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    },

    // Đảo ngược trạng thái khóa/mở tài khoản một cách thủ công (Dành cho Admin)
    ToggleLock: async function (id) {
        let user = await userModel.findById(id);
        if (user) {
            // Nếu đang khóa thì mở, nếu đang mở thì khóa 1 tiếng
            user.lockTime = user.lockTime ? null : Date.now() + 3600000;
            await user.save();
        }
        return user;
    }
};
