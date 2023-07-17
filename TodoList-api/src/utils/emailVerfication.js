
const jwt = require("jsonwebtoken");
const {sendEmail} = require("../utils/emailHandler");

function generateEmailVerificationToken(email){
    var date = new Date();
    var mail = {
            "email": email,
            "created": date.toString()
    }
    return jwt.sign(mail, process.env.EMAIL_VERIFICATION_TOKEN_SECRET, { expiresIn: eval(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY) });
}

function parseEmailVerificationToken(jwtToken){
    let payload = jwt.verify(jwtToken, process.env.EMAIL_VERIFICATION_TOKEN_SECRET);
    return payload.email;
}

async function sendVerficationEmail(email){

    let emailToken = generateEmailVerificationToken(email);

    let subject = "Email Verification of Emumba To Do List";
    
    let emailBody = '<html><h2>Email Verification of Emumba To Do List</h2><p>Please, verify your email in emumba using the given link</p><a href = "http://localhost:'+process.env.PORT+'/user/verifyEmail?token='+emailToken+'"><button>Verify Email</button></a></html>';

    let response = await sendEmail(email, subject, emailBody);

    return response;
}

module.exports = {generateEmailVerificationToken, parseEmailVerificationToken, sendVerficationEmail}