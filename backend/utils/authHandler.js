let userController = require('../controllers/users')
let jwt = require('jsonwebtoken')
let JWT_COOKIE_NAME = process.env.JWT_COOKIE_NAME || 'AUTH_TOKEN'

module.exports = {
    CheckLogin: async function (req, res, next) {
        try {
            let token;
            if (req.cookies[JWT_COOKIE_NAME]) {
                token = req.cookies[JWT_COOKIE_NAME]
            } else {
                token = req.headers.authorization;
                if (!token || !token.startsWith("Bearer")) {
                    res.status(403).send({ message: "ban chua dang nhap" })
                    return;
                }
                token = token.split(' ')[1]
            }
            let result = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            if (result.exp * 1000 < Date.now()) {
                res.status(403).send({ message: "ban chua dang nhap" })
                return;
            }
            let getUser = await userController.GetUserById(result.id || result._id);
            if (!getUser) {
                res.status(403).send({ message: "ban chua dang nhap" })
            } else {
                req.user = getUser;
                next();
            }
        } catch (error) {
            res.status(403).send({ message: "ban chua dang nhap" })
        }

    },
    checkRole: function (...requiredRoles) {
        return function (req, res, next) {
            if (!req.user) {
                res.status(403).send({ message: "ban chua dang nhap" })
                return;
            }
            let roleOfUser = req.user.role?.name;
            if (requiredRoles.includes(roleOfUser)) {
                next();
            } else {
                res.status(403).send("ban khong co quyen")
            }
        }
    }
}
