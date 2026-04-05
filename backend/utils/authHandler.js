let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let { getRoleName } = require('./roleUtils')
let JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN'

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token;
            if (req.cookies[JWT_COOKIE_NAME]) {
                token = req.cookies[JWT_COOKIE_NAME]
            } else {
                const authHeader = req.headers.authorization;
                if (!authHeader || !/^Bearer\s+/i.test(authHeader)) {
                    res.status(403).json({ message: 'Bạn chưa đăng nhập hoặc thiếu mã xác thực.' })
                    return;
                }
                token = authHeader.replace(/^Bearer\s+/i, '').trim()
            }
            let result = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            if (result.exp * 1000 < Date.now()) {
                res.status(403).json({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' })
                return;
            }
            let getUser = await userController.GetUserById(result.id || result._id);
            if (!getUser) {
                res.status(403).json({ message: 'Tài khoản không còn hợp lệ. Vui lòng đăng nhập lại.' })
                return;
            }
            req.user = getUser;
            next();
        } catch (error) {
            res.status(403).json({ message: 'Mã đăng nhập không hợp lệ hoặc đã hết hạn.' })
        }

    },
    checkRole: function (...requiredRoles) {
        return function (req, res, next) {
            if (!req.user) {
                res.status(403).json({ message: 'Bạn chưa đăng nhập.' })
                return;
            }
            const roleOfUser = getRoleName(req.user);
            const allowed = requiredRoles.map((r) => String(r).toUpperCase().trim());
            if (roleOfUser && allowed.includes(roleOfUser)) {
                next();
            } else {
                res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' })
            }
        }
    }
}
