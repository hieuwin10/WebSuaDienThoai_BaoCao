let { body, validationResult } = require('express-validator')

module.exports = {
    validatedResult: function (req, res, next) {
        let result = validationResult(req);
        if (result.errors.length > 0) {
            res.status(400).send(result.errors.map(
                function (e) {
                    return {
                        [e.path]: e.msg
                    }
                }
            ));
            return;
        }
        next();
    },
    CreateAnUserValidator: [
        body('email').notEmpty().withMessage('Email không được để trống.').bail().isEmail().withMessage('Email không đúng định dạng.').normalizeEmail(),
        body('username').notEmpty().withMessage('Tên đăng nhập không được để trống.').bail().isAlphanumeric().withMessage('Tên đăng nhập chỉ gồm chữ và số, không dùng ký tự đặc biệt.'),
        body('password').notEmpty().withMessage('Mật khẩu không được để trống.').bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage('Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
        body('role').notEmpty().withMessage('Vai trò không được để trống.').bail().isMongoId().withMessage('Vai trò phải là mã ID hợp lệ.'),
    ],
    RegisterValidator: [
        body('email').notEmpty().withMessage('Email không được để trống.').bail().isEmail().withMessage('Email không đúng định dạng.').normalizeEmail(),
        body('username').notEmpty().withMessage('Tên đăng nhập không được để trống.').bail().isAlphanumeric().withMessage('Tên đăng nhập chỉ gồm chữ và số, không dùng ký tự đặc biệt.'),
        body('password').notEmpty().withMessage('Mật khẩu không được để trống.').bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage('Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
    ],
    ChangePasswordValidator: [
        body('oldpassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống.'),
        body('newpassword').notEmpty().withMessage('Mật khẩu mới không được để trống.').bail().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage('Mật khẩu mới tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
    ],
    ForgotPasswordValidator: [
        body('email').notEmpty().withMessage('Email không được để trống.').bail().isEmail().withMessage('Email không đúng định dạng.'),
    ],
    ModifyAnUserValidator: [
        body('password').optional().isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            minUppercase: 1
        }).withMessage('Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
    ]
}
