const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.MAIL_PORT || 2525,
    secure: false,
    auth: {
        user: process.env.MAIL_USER || "",
        pass: process.env.MAIL_PASS || "",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || 'noreply@doan-c3.com',
            to: to,
            subject: "reset password email",
            text: "click vao day de doi pass",
            html: `click vao <a href="${url}">day</a> de doi pass`,
        })
    }
}
