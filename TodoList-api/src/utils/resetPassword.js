const jwt = require("jsonwebtoken");
const {sendEmail} = require("../utils/emailHandler");

function generateResetPasswordToken(email){
    var date = new Date();
    var mail = {
            "email": email,
            "created": date.toString()
    }
    return jwt.sign(mail, process.env.RESET_PASSWORD_TOKEN_SECRET, { expiresIn: eval(process.env.RESET_PASSWORD_TOKEN_EXPIRY) });
}

function parseResetPasswordToken(jwtToken){
    let payload = jwt.verify(jwtToken, process.env.RESET_PASSWORD_TOKEN_SECRET);
    return payload.email;
}

async function sendResetPasswordEmail(email){

    let resetPasswordToken = generateResetPasswordToken(email);

    let subject = "Reset Password of Emumba To Do List";
    
    let emailBody = '<html><h2>Reset Passsword of Emumba To Do List</h2><p>Please, reset your password in emumba todo list using the given link</p><a href = "http://localhost:'+process.env.PORT+'/user/resetPassword?token='+resetPasswordToken+'"><button>Verify Email</button></a></html>';

    let response = await sendEmail(email, subject, emailBody);

    return response;
}

module.exports = {generateResetPasswordToken, parseResetPasswordToken, sendResetPasswordEmail}