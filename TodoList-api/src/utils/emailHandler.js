const nodemailer = require('nodemailer');

async function sendEmail(email, subject, body) {
    var mail = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID, // Your email id
            pass: process.env.EMAIL_PASSWORD // Your password
        }
    });
 
    var mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: subject,
        html: body
    };
 
    return mail.sendMail(mailOptions)
}

module.exports = {sendEmail};