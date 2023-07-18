const db = require('../models/index');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Refresh_Token = db.refreshTokens;
const Op = db.Sequelize.Op;
const emailValidator = require('deep-email-validator');
const {sendVerficationEmail, parseEmailVerificationToken} = require('../utils/emailVerfication');
const {sendResetPasswordEmail, parseResetPasswordToken} = require('../utils/resetPassword');
const { getToken, getRefreshToken } = require('../utils/authentication');
const {messageResponse, dataResponse, errorResponse} = require('../utils/commonResponse')

/*
Sign Up

Request: 
{
    "user":{
        "name": String
        "email": String
        "password": String
    }
}

Success Response:
{
    "status": "success",
    "data":{
        "user": {
        "taskNo": Number,
        "verified": Boolean,
        "id": Number,
        "name": String,
        "email": String,
        "updatedAt": Date,
        "createdAt": Date
        }
    }
    
}
*/
const signup = async (req, res)=>{

    try{
        let user_request = req.body;
        //Check if Email is valid or not
        if(!(await emailValidator.validate(user_request.email)).valid){
            return res.status(400).send(
                errorResponse("Bad Request", "Provided Email is not valid")
            )
        }

        //Check if User Already Exists
        let user = await User.findOne({where: {
                email: {
                    [Op.like] : user_request.email
                }
        }}).catch(error => {
            return res.status(500).send(
                errorResponse("Internal Server Error", error))
            }
        );

        if(user){
            return res.status(409).send(errorResponse("Conflict", "User with current email already exists"));
        }


        user_request.hashedPassword = generateHash(user_request.password);



        user = await User.create(user_request, {fields: ['name', 'email', 'hashedPassword']}).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });




        return res.status(200).send(dataResponse("success", {user}))


    }
    catch(error){
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Send Verification Email

Request: 
Bearer Token In Header

Success Response:
{
    "status": "sucess",
    "message": "Account Verifcation Email has been sent successfully"
}
*/
const sendVerificationEmail= async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            return res.status(500).send(
                errorResponse("Internal Server Error", error)
                )
        });


        if(!user)
        {
            return res.status(404).send(
                errorResponse("Not Found", "User with the given information doesn't exist"))
        }

        
        if(user.dataValues.verified){
            return res.status(409).send(errorResponse("Conflict", "User with current email is already verified"));
        }

        let emailResponse = null;

        try{
            emailResponse = await sendVerficationEmail(user.dataValues.email);
        }
        catch(error){
            return res.status(500).send(
                errorResponse("Internal Server Error",error)
            )
        }

        if(emailResponse.accepted.length == 0){
            return res.status(500).send(errorResponse("Internal Server Error", ""));
        }

        return res.status(200).send(messageResponse("success", "Account Verifcation Email has been sent successfully"));
    }
    catch(error){
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Verify Email

Request: 
JWT Token In Query

Success Response:
{
    "status": "sucess",
    "data":{
        "user": 
            {
            "taskNo": Number,
            "verified": Boolean,
            "id": Number,
            "name": String,
            "email": String,
            "updatedAt": Date,
            "createdAt": Date
            }
    }
}
*/
const verifyEmail = async(req, res)=>{
    try{
        let email = parseEmailVerificationToken(req.query.token);

        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                email: email
            }
        }).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });


        if(!user)
        {
            return res.status(404).send(errorResponse("Not Found", "User with the given information doesn't exist"))
        }

        
        if(user.dataValues.verified){
            return res.status(409).send(
                errorResponse("Conflict", "User is already verified"))
        }

        user.verified = true;

        await user.save();
        

        return res.send(dataResponse("success", {user}));
    }
    catch(error)
    {
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Send Reset Password Email

Request: 
Bearer Token In Header

Success Response:
{
    "status": "sucess",
    "message": "Reset Password Email has been sent successfully"
}
*/
const _sendResetPasswordEmail = async(req, res) => {
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });


        if(!user)
        {
            return res.status(404).send(
                errorResponse("Not Found", "User with the given information doesn't exist")
            )
        }

        
        if(user.dataValues.verified){
            return res.status(400).send(
                errorResponse("Bad Request", "User is already verified"))
        }

        let emailResponse = null;

        try{
            emailResponse = await sendResetPasswordEmail(user.dataValues.email);
        }
        catch(error){
            return res.status(500).send(
                errorResponse("Internal Server Error", "Verification Email couldn't be sent to targetted email"))
        }

        if(emailResponse.accepted.length == 0){
            return res.status(500).send(
                errorResponse("Internal Server Error", "Verification Email couldn't be sent to targetted email"));
        }

        return res.status(200).send(
            messageResponse("success", "Reset Password Email has been sent successfully"));
    }
    catch(error){
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Verify Email

Request: 
JWT Token In Query
{
    "password": String
}
Success Response:
{
    "status": "sucess",
    "message": "Your password has been reset successfully"
}
*/
const resetPasssword = async(req, res)=>{
    try{
        let email = parseResetPasswordToken(req.query.token);

        let newPassword = req.body.password;

        let hashedPassword = generateHash(newPassword);

        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                email: email
            }
        }).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });


        if(!user)
        {
            return res.status(404).send(errorResponse("Not Found", "User with given details doesn't exist"))
        }

        
        if(user.dataValues.verified){
            return res.status(400).send(errorResponse("Bad Request", "Bad Request, User is already verified"))
        }

        user.hashedPassword = hashedPassword;

        await user.save();
        

        return res.send(messageResponse("success", "Your password has been reset successfully"));
    }
    catch(error)
    {
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Request

Response:
{
    "data":  {
        "users":[
            {
            "taskNo": Number,
            "verified": Boolean,
            "id": Number,
            "name": String,
            "email": String,
            "updatedAt": Date,
            "createdAt": Date
            }
        ]
    }
}
*/
const getAllUsers = async (req, res) => {
    let users = await User.findAll({attributes: {exclude: ['hashedPassword']}}).catch(
        (error)=> {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        }
    );
    
    return res.send(dataResponse("success", {users}));
}

/*
Request: 
Bearer Token In Header

Success Response:
{
    "status": "success",
    "data": {
        "user": 
        {
        "taskNo": Number,
        "verified": Boolean,
        "id": Number,
        "name": String,
        "email": String,
        "updatedAt": Date,
        "createdAt": Date
        }
    }
}
*/
const profile = async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.user.id
            }
        }).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });

        if(!user)
        {
            return res.status(404).send(errorResponse("Not Found", "User with given details doesn't exist"))
        }

        return res.status(200).send(dataResponse("success", {data}));
    }
    catch(error){
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

/*
Request: 
Bearer Token In Header

Success Response:
{
    "status": "success",
    "data":{
        "token": String,
        "refreshToken": String,
        "user": {
        "taskNo": Number,
        "verified": Boolean,
        "id": Number,
        "name": String,
        "email": String,
        "updatedAt": Date,
        "createdAt": Date
        }
    }
    
}
*/
const signin = async (req, res) => {
    try {
        //Check if User Already Exists or not
        let user = await User.findOne({where: {
            email: {
                [Op.like] : req.body.email
            }
        }}).catch(error => {
            return res.status(500).send(errorResponse("Internal Server Error", error))
        });

        if(!user){
            return res.status(404).send(
                errorResponse("Not Found", "User with given email doesn't exist"));
        }
        //Check if Password Matches//
        let isMatch = comparePassword(req.body.password, user.hashedPassword);
        if(!isMatch){
            return res.status(409).send(
                errorResponse("Authentication Error", "Please Provide correct credentials to login"));
        }
        
        user.hashedPassword = undefined;

        let payload = {
            id: user.dataValues.id,
            email: user.dataValues.emal
        }

        let token = getToken(payload);

        let refreshToken = getRefreshToken(payload);


        await Refresh_Token.create({userID: user.id, refreshToken}).catch(error => {
            return res.status(500).send(
                errorResponse("Internal Server Error", error))
        });

        return res.send(dataResponse("success", {user, token, refreshToken}));
    }
    catch(error)
    {
        return res.status(400).send(errorResponse("Bad Request", error));
    }
}

const getSpecificUsers = async(req, res) => {
    let users 
}

module.exports = {signin, signup, profile, getAllUsers, sendVerificationEmail, verifyEmail, _sendResetPasswordEmail, resetPasssword}