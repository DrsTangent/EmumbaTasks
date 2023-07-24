const db = require('../models/index');
const createError = require('http-errors');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Refresh_Token = db.refreshTokens;
const Task = db.tasks;
const Op = db.Sequelize.Op;
const emailValidator = require('deep-email-validator');
const {sendVerficationEmail, parseEmailVerificationToken} = require('../utils/emailVerfication');
const {sendResetPasswordEmail, parseResetPasswordToken} = require('../utils/resetPassword');
const { getToken, getRefreshToken, getFBAccessToken, getFacebookUserData } = require('../utils/authentication');
const {messageResponse, dataResponse, errorResponse} = require('../utils/commonResponse');
const refreshToken = require('../models/refreshToken');
const { response } = require('express');
const axios = require("axios");

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
const signup = async (req, res,next)=>{

    try{
        let user_request = req.body.user;
        //Check if Email is valid or not
        if(!(await emailValidator.validate(user_request.email)).valid){
            throw new createError.BadRequest("Provided Email is not valid");
        }

        //Check if User Already Exists
        let user = await User.findOne({where: {
                email: {
                    [Op.iLike] : user_request.email
                }
        }}).catch(error => {
            throw new createError.InternalServerError(error);
        }
        );

        if(user){
            throw new createError.Conflict("User with current email already exists");
        }


        user_request.hashedPassword = generateHash(user_request.password);



        user = await User.create(user_request, {fields: ['name', 'email', 'hashedPassword']}).catch(error => {
            throw new createError.InternalServerError(error);
        });

        let payload = {
            id: user.dataValues.id,
            email: user.dataValues.emal
        }

        let token = getToken(payload);

        let refreshToken = getRefreshToken(payload);


        await Refresh_Token.create({userID: user.id, refreshToken}).catch(error => {
            throw new createError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {token, refreshToken, user}))
    }
    catch(error){
        next(error);
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
        let user_request = req.body.user;

        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                email: user_request.email
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });


        if(!user)
        {
            throw new createError.NotFound("User with the given information doesn't exist")
        }

        
        if(user.dataValues.verified){
            throw new createError.BadRequest("User is already verified");
        }

        let emailResponse =  await sendResetPasswordEmail(user.dataValues.email).catch((error)=>{
            throw new createError.InternalServerError(error);
        })

        if(emailResponse.accepted.length == 0){
            throw new createError.InternalServerError("Verification Email couldn't be sent to targetted email");
        }

        return res.status(200).send(
            messageResponse("success", "Reset Password Email has been sent successfully"));
    }
    catch(error){
        next(error);
    }
}

/*
Reset Password

Request: 
JWT Token In Query
{
    "user":{
        "password": String
    }
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

        let newPassword = req.body.user.password;

        let hashedPassword = generateHash(newPassword);

        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                email: email
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });


        if(!user)
        {
            throw new createError.NotFound("User with given details doesn't exist");
        }

        user.hashedPassword = hashedPassword;

        await user.save();
        

        return res.send(messageResponse("success", "Your password has been reset successfully"));
    }
    catch(error)
    {
        next(error)
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
            throw new createError.InternalServerError(error);
        });


        if(!user)
        {
            throw new createError.NotFound("User with the given details doesn't exist");
        }

        
        if(user.dataValues.verified){
            throw new createError.Conflict("User with current email is already verified");
        }

        let emailResponse = await sendVerficationEmail(user.dataValues.email).catch(error=>{
            throw new createError.InternalServerError(error);
        });

        if(emailResponse.accepted.length == 0){
            throw new createError.InternalServerError("Email couldn't be send to targetted email id");
        }

        return res.status(200).send(messageResponse("success", "Account Verifcation Email has been sent successfully"));
    }
    catch(error){
        next(error);
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
            throw new createError.InternalServerError(error);
        });


        if(!user)
        {
            throw new createError.NotFound("User with the provided details doesn't exist");
        }

        
        if(user.dataValues.verified){
            throw new createError.Conflict("User is already verified");
        }

        user.verified = true;

        await user.save();
        

        return res.send(dataResponse("success", {user}));
    }
    catch(error)
    {
        next(error)
    }
}

/*
Request: 
{
    "user":{
        "email": String,
        "password": String
    }
}

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
        let user_request = req.body.user;
        //Check if User Already Exists or not
        let user = await User.findOne({where: {
            email: {
                [Op.like] : user_request.email
            }
        }}).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user){
            throw new createError.NotFound("User with given email doesn't exist");
        }
        //Check if Password Matches//
        let isMatch = comparePassword(user_request.password, user.hashedPassword);
        if(!isMatch){
            throw new createError.Unauthorized("Please provide correct credentials to login");
        }
        
        user.hashedPassword = undefined;

        let payload = {
            id: user.dataValues.id,
            email: user.dataValues.emal
        }

        let token = getToken(payload);

        let refreshToken = getRefreshToken(payload);


        await Refresh_Token.create({userID: user.id, refreshToken}).catch(error => {
            throw new createError.InternalServerError(error);
        });

        return res.send(dataResponse("success", {user, token, refreshToken}));
    }
    catch(error)
    {
        next(error);
    }
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
                id: req.body.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with the given details doesn't exist");
        }

        next();

        return res.status(200).send(dataResponse("success", {user}));
    }
    catch(error){
        next(error);
    }
}

/*
Sign Out

Request
Brear Authentication Token in Header
{
    "refreshToken": String
}
Response
{
    "status": "success",
    "message": "You've been logout successfully."
}
*/
const signout = async(req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with the given details doesn't exist");
        }

        let destroyedToken = await Refresh_Token.destroy({
            where:{
                "refreshToken": req.body.refreshToken
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!destroyedToken){
            throw new createError.NotFound("Provided refresh token doesn't exist");
        }

        return res.status(200).send(dataResponse("success", "You've been logged out successfully."));
    }
    catch(error){
        next(error);
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
const getAllUsers = async (req, res, next) => {
    try
    {
        let users = await User.findAll({attributes: {exclude: ['hashedPassword']}}).catch(
            (error)=> {
                throw new createError.InternalServerError(error);
            }
        );
        
        return res.send(dataResponse("success", {users}));
    }
    catch(error){
        next(error);
    }
}

/*
Request
Params =>
/users/:id

Response:
{
    "data":  {
        "user":{
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
const getSpecificUser  = async (req, res, next)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.params.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with given details doesn't exist");
        }

        return res.status(200).send(dataResponse("success", {user}));
    }
    catch(error){
        next(error);
    }
}

/*
Request:
Authentication Token in Header
{
    "refreshToken": String
}

Response:
{
    "refreshToken": String
    "token": String
}
*/
const refreshTokenCall = async(req, res)=>{
    try {
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with given details doesn't exist");
        }

        let payload = {
            id: user.dataValues.id,
            email: user.dataValues.emal
        }

        let token = getToken(payload);

        let refreshToken = getRefreshToken(payload);

        let newRefreshToken = await Refresh_Token.update(
            {"refreshToken": refreshToken},
            {
                where:{
                    "refreshToken": req.body.refreshToken
                }
            }
        ).catch(error => {
            throw new createError.InternalServerError(error);
        })

        return res.send(dataResponse("success", {token, refreshToken}));
    }
    catch(error)
    {
        next(error)
    }
}


/*
Request
Params =>
/users/:id

Response:
{
    "data":  {
        "user":{
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
const deleteUser  = async (req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.params.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with given details doesn't exist");
        }

        await Refresh_Token.destroy({
            where:{
                userID: user.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        })

        await Task.destroy({
            where: {
                userID: user.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        })

        await user.destroy().catch(error => {
            throw new createError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {user}));
    }
    catch(error){
        next(error)
    }
}

/*
Request
{
    "user":{
        "taskNo": Number,
        "verified": Boolean,
        "name": String,
        "email": String
    }
}

Response
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
const updateUser = async(req, res)=>{
    try{
        
        await User.update(req.body.user, {
            where: {
                id: req.params.id
            }
        }).catch(error=>{
            throw new createError.InternalServerError(error);
        });
    }
    catch(error)
    {
        next(error)
    }
}

const setPassword = async(req, res)=>{
    try{
        let user = await User.findOne({
            attributes: {exclude: ['hashedPassword']},
            where: {
                id: req.body.id
            }
        }).catch(error => {
            throw new createError.InternalServerError(error);
        });

        if(!user)
        {
            throw new createError.NotFound("User with given details doesn't exist");
        }



        return res.status(200).send(dataResponse("success", {user}));
    }
    catch(error){
        next(error)
    }
}

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
const addUser = async (req, res)=>{

    try{
        let user_request = req.body.user;
        //Check if Email is valid or not
        if(!(await emailValidator.validate(user_request.email)).valid){
            throw new createError.BadRequest("Provided Email is not valid");
        }

        //Check if User Already Exists
        
         let user = await User.findOne({where: {
                email: {
                    [Op.like] : user_request.email
                }
        }});

        if(user){
            throw new createError.Conflict("User with current email id already exists");
        }


        user_request.hashedPassword = generateHash(user_request.password);

        try{
            user =await User.create(user_request, {fields: ['name', 'email', 'hashedPassword']})
        }
        catch(error){
            throw new createError.InternalServerError(error);
        }

        user = await User.create(user_request, {fields: ['name', 'email', 'hashedPassword']}).catch(error => {
            throw new createError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {user}))
    }
    catch(error){
        next(error)
    }
}

const oauthRedirect = async (req, res)=>{
    let details = await axios({
        method: "POST",
        url: `${process.env.GITHUB_URL}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${req.query.code}`,
        headers: {
          Accept: "application/json",
        },
      });
    console.log(await details.data);
    res.send({data:details.data});
}

//https://www.facebook.com/v4.0/dialog/oauth?client_id=1211232373611138&redirect_uri=http://localhost:8080/users/facebookauth&scope=email

const facebookOAuth = async (req, res)=>{
    try{
        let details = await getFBAccessToken(req.query.code).catch(
            error=>{
                throw new createError.InternalServerError(error);
            }
        );
        console.log(details);
    
        let userInformation = await getFacebookUserData(details)
    
        res.send({userInformation});
    }
    catch(error){
        next(error);
    }
}

module.exports = {signin, signup, profile, getAllUsers, sendVerificationEmail, verifyEmail, 
    _sendResetPasswordEmail, resetPasssword, signout, getSpecificUser, refreshTokenCall, addUser,
    deleteUser, updateUser, setPassword, oauthRedirect, facebookOAuth}