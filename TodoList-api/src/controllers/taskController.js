const db = require('../models/index');
const createHttpError = require('http-errors');
const User = db.users;
const Task = db.tasks;
const {messageResponse, dataResponse} = require('../utils/commonResponse');
const MAX_TASK_LIMIT = 50;
const fs = require("fs");
const { filePathToFileUrl, fileUrlToFilePath } = require('../utils/fileHandling');

const createTask = async (req, res, next) => {
    try{
        
        let user = await User.findOne({
            where:{
                id: req.user.id
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
        
        let task = await Task.create({
            userID: req.user.id,
            title,
            description,
            dueDate: new Date(dueDate),
        }).catch(
            (error)=>{
                throw new createHttpError.InternalServerError(error);
            }
        );

        user.taskNo = user.dataValues.taskNo + 1;

        user.save();
        task.save();

        return res.status(200).send(dataResponse("success", task))

    }
    catch(error){
        next(error);
    }
}

const getAllTasks = async(req, res, next)=>{
    try{
        let tasks = await Task.findAll({
            where: {
                userID: req.user.id
            }
        }).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })

        return res.status(200).send(dataResponse("success", {tasks}))
    }
    catch(error){
        next(error);
    }
}

const getTaskById = async(req, res, next)=>{
    try{
        let taskID =  req.params.id;

        let task = await Task.findOne({
            where: {
                userID: req.user.id,
                id: taskID
            }
        }).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })
        
        if(!task){
            throw new createHttpError.NotFound(`Task with ${taskID} doesn't belong to your account or it doesn't exist`);
        }

        return res.status(200).send(dataResponse("success", {task}))
    }
    catch(error){
        next(error);
    }
}

const updateTask = async(req, res, next)=>{
    try{
        let taskID =  req.params.id;
        // {id, title, userID, description, dueDate, filePath, completionStatus, completionDate}

        const {title, description, dueDate, completionStatus, completionDate} = req.body.task;

        let task = await Task.findOne(
            {
            where: {
                userID: req.user.id,
                id: taskID
            }
            }
        ).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })
        
        if(!task){
            throw new createHttpError.NotFound(`Task with ${taskID} doesn't belong to your account or it doesn't exist`);
        }

        await task.update({
            userID: req.user.id,
            title,
            description,
            dueDate: new Date(dueDate),
            completionStatus,
            completionDate
        }).catch(error => {
            throw new createHttpError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {task}))
    }
    catch(error){
        next(error);
    }
}

const deleteTask = async(req, res, next)=>{
    try{
        let taskID =  req.params.id;
        // {id, title, userID, description, dueDate, filePath, completionStatus, completionDate}

        let task = await Task.findOne(
            {
            where: {
                userID: req.user.id,
                id: taskID
            }
            }
        ).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })

        if(!task){
            throw new createHttpError.NotFound(`Task with ${taskID} doesn't belong to your account or it doesn't exist`);
        }

        if(task.dataValues.fileUrl){
            await fs.unlink(fileUrlToFilePath(filePath)).catch((error)=>{
                throw new createHttpError.InternalServerError(error)
            })
        }

        await task.destroy().catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        })

        return res.status(200).send(messageResponse("success", `Task with task id ${taskID} has been deleted successfully`));
    }
    catch(error){
        next(error);
    }
}

const uploadFile = async (req, res, next) => {
    try{
        let taskID = req.params.id;

        let task = await Task.findOne(
            {
            where: {
                userID: req.user.id,
                id: taskID
            }
            }
        ).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })

        if(!task){
            throw new createHttpError.NotFound(`Task with task id ${taskID} doesn't belong to your account or it doesn't exist`);
        }

        if(!req.file){
            throw new createHttpError.BadRequest(`An error occured while adding file`);
        }



        let fileUrl = filePathToFileUrl(req.file.path)
        
        let successMessage = "file has been successfully added.";

        if(task.dataValues.fileUrl){
            successMessage = "New file has been replaced"
            //delete the file if path is not same.
            if(task.dataValues.fileUrl != fileUrl)
                fs.unlinkSync(fileUrlToFilePath(task.fileUrl))   
        }

        task.fileUrl = fileUrl;

        await task.save();

        return res.status(200).send(dataResponse("success", {successMessage, fileUrl}));
    }
    catch(error){
        next(error)
    }
}

const deleteFile = async (req, res, next) => {
    try{
        let taskID = req.params.id;

        let task = await Task.findOne(
            {
            where: {
                userID: req.user.id,
                id: taskID
            }
            }
        ).catch(error => {
            throw new createHttpError.InternalServerError(error);
        })

        if(!task){
            throw new createHttpError.NotFound(`Task with task id ${taskID} doesn't belong to your account or it doesn't exist`);
        }


        if(!task.fileUrl)
            throw new createHttpError.BadRequest('No file is attached to the given task');

        let filePath = fileUrlToFilePath(task.fileUrl)


        await fs.unlink(fileUrlToFilePath(filePath)).catch((error)=>{
            throw new createHttpError.InternalServerError(error)
        })

        task.fileUrl = null;

        await task.save();

        return res.status(200).send(messageResponse("success", "Attachment has been deleted from the task"));
    }
    catch(error){
        next(error)
    }
}

module.exports = {createTask, getAllTasks, getTaskById, updateTask, deleteTask, uploadFile, deleteFile}
