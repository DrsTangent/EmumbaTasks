const createHttpError = require('http-errors');
const db = require('../models/index');
const { dataResponse } = require('../utils/commonResponse');
const {sequelize, Sequelize:{Op}} = db;
const User = db.users;
const Task = db.tasks;

// Count of total tasks, completed tasks, and remaining tasks
const getTasksStatus = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let tasksStatus = await Task.findOne({
            where:{
                userID: userId
            },
            attributes: [
              [sequelize.fn('COUNT', sequelize.col('id')), 'totalTasks'],
              [sequelize.fn('SUM', sequelize.literal('IF(completionStatus, 1, 0)')), 'completedTasks']
            ]
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });
        
        let totalTasks = tasksStatus.dataValues.totalTasks;
        let completedTasks = parseInt(tasksStatus.dataValues.completedTasks);
        let incompletedTasks = totalTasks - completedTasks;

        return res.status(200).send(dataResponse("success", {totalTasks, completedTasks, incompletedTasks}));
    }
    catch(error){
        next(error)
    }
}
// Average number of tasks completed per day since creation of account
const getAverageTasksCompletion = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let user = await User.findOne({
            attributes: ['name', 'email', 'createdAt',[sequelize.fn('COUNT', sequelize.col('tasks.userID')), "completedTasksNo"]],
            where: {
                id: userId
            },
            include: {
                model: Task,
                where: {
                    completionStatus: true
                },
                //attributes: [sequelize.fn('COUNT', sequelize.col('tasks.id')), 'totalCompletedTasksNo']
            },
            group: ['tasks.userID']
        }).catch((error) => {
            throw new createHttpError.InternalServerError(error);
        })
        
        let toDayUnix = new Date().getTime();
        let createdUserUnix = new Date(user.createdAt).getTime()
        let miliSecTimeDiff = toDayUnix - createdUserUnix;
        let dayTimeDiff = miliSecTimeDiff/(1000*60*60*24);
        let averageTasksPerDay = user.dataValues.completedTasksNo/dayTimeDiff;

        console.log(totalTasks, dayTimeDiff);
        res.status(200).send(dataResponse("success", {averageTasksPerDay}))
    }
    catch(error){
        next(error)
    }
}
// Count of tasks which could not be completed on time
const getMissedDeadlineTasks = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let missedTaks = await Task.findAll({
            where: {
                [Op.and]: [
                    {
                        userID: userId
                    },
                    {
                        [Op.or]:[
                            {[Op.and] : [
                                {completionStatus: true},
                                {completionDate: {[Op.gt]: sequelize.col('dueDate')}}
                            ]},
                            {[Op.and] : [
                                {completionStatus: false},
                                {dueDate: {[Op.lt]: new Date()}}
                            ]},
                        ]
                    }
                ]
            }
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });

        let missedTasksNo = missedTaks.length;

        res.status(200).send(dataResponse("success", {missedTasksNo, missedTaks}))

    }
    catch(error){
        next(error)
    }
}
// Since time of account creation, on what date, maximum number of tasks were completed in a single day
const getMaximumTasksCompletionDate = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let tasks = await Task.findOne({
            where: {
                userID: userId,
                completionDate: {[Op.not]: null}
            },
            attributes:[
                [sequelize.fn('date', sequelize.col('completionDate')), "completionDateOnly"], 
                [sequelize.fn('COUNT', sequelize.col('id')), "totalTasksCompleted"],
            ],
            group: ["completionDateOnly"],
            order: [
                [sequelize.literal('totalTasksCompleted'), 'DESC']
            ],
            limit: 1
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {...tasks.dataValues}));

    }
    catch(error){
        next(error)
    }
}
// Since time of account creation, how many tasks are opened on every day of the week (mon, tue, wed, ....)
const getTasksCreatedDayWise = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let tasks = await Task.findAll({
            where: {
                userID: userId
            },
            attributes:[
                [sequelize.fn('dayname', sequelize.col('createdAt')), 'createdDay'],
                [sequelize.fn('count', sequelize.col('id')), 'tasksNo']
            ],
            group:['createdDay']
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });

        return res.status(200).send(dataResponse("success", {tasks}))
    }
    catch(error){
        next(error)
    }
}

module.exports = {getTasksStatus, getAverageTasksCompletion, getMaximumTasksCompletionDate, getMissedDeadlineTasks, getTasksCreatedDayWise}
