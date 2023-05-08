const nodemailer = require("nodemailer");

exports.sendEmail = (email, subject, content) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.EMAILPORT,
            service: process.env.SERVICE,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            html: content,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};