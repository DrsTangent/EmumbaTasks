const db = require('../models/index');
const createHttpError = require('http-errors');
const { comparePassword, generateHash } = require('../utils/passwordGeneration');
const User = db.users;
const Refresh_Token = db.refreshTokens;
const Task = db.tasks;
const Local_Strategy=db.localStrategy;
const Oauth_Strategy=db.oauthStrategy;
const Op = db.Sequelize.Op;
const emailValidator = require('deep-email-validator');
const {sendVerficationEmail, parseEmailVerificationToken} = require('../utils/emailVerfication');
const {sendResetPasswordEmail, parseResetPasswordToken} = require('../utils/resetPassword');
const { getToken, getRefreshToken, getFBAccessToken, getFacebookUserData } = require('../utils/authentication');
const {messageResponse, dataResponse} = require('../utils/commonResponse');
const cookieOptions = require('../../config/cookieConfig');
const axios = require("axios");
const MAX_TASK_LIMIT = 50;

const createTask = async (req, res, next) => {
    try{
        
        let user = await User.findOne({
            where:{
                id: req.body.user.id
            }
        }).catch(error => {throw new createHttpError.InternalServerError(error)});

        if(!user){
            throw new createHttpError.NotFound("User with given id doesn't exist");
        }

        if(user.dataValues.taskNo >= MAX_TASK_LIMIT){
            throw new createHttpError.BadRequest(`Sorry max limit has been reached for this account, max limit is ${MAX_TASK_LIMIT}`);
        }
        // {id, title, userID, description, dueDate, filePath, completionStatus, completionDate}

        const {title, description, dueDate} = req.body.task;
        
        task = await Task.create({
            userID: req.body.user.id,
            title,
            description,
            dueDate: new Date(dueDate)
        }).catch(
            (error)=>{
                throw new createHttpError.InternalServerError(error);
            }
        );

        user.taskNo = user.dataValues.taskNo + 1;

        user.save();

        return res.status(200).send(dataResponse("success", task))

    }
    catch(error){
        next(error);
    }
}

function view(req, res){

}

function edit(req, res){

}

function update(req, res){

}

function destroy(req, res){

}

function attachment(req, res){

}

module.exports = {createTask, view, edit, update, destroy, attachment}