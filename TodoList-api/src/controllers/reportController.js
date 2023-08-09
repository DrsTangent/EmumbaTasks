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
    }
    catch(error){
        next(error)
    }
}
// Count of tasks which could not be completed on time
const getMissedDeadlineTasks = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let tasks = await Task.findAll({
            where: {
                userID: userId
            }
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });

        let missedDeadlineTasks = 0;

        for(task of tasks){
            let dueDate = new Date(task.dueDate);
            if(tasks.completionDate){
                let completionDate = new Date(tasks.completionDate);
                if(completionDate > dueDate)
                    missedDeadlineTasks++;
            }
            else
            {
                let dateNow = new Date();
                if(dueDate < dateNow){
                    missedDeadlineTasks++;
                }
            }
        }

        res.status(200).send(dataResponse("success", {missedDeadlineTasks}))

    }
    catch(error){
        next(error)
    }
}
// Since time of account creation, on what date, maximum number of tasks were completed in a single day
const getMaximumTasksCompletionDate = async(req, res, next) => {
    try{
        let userId = req.user.id;

        let tasks = await Task.findAll({
            where: {
                userID: userId,
                completionDate: {[Op.not]: null}
            },
            attributes:[
                [sequelize.fn('date', sequelize.col('completionDate')), "completionDate"]
            ]
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });

        let tasksDone = {};

        let maxTasksDate = null;

        //Assign Completed Tasks Acccording to it's date//
        for(task of tasks){
            if(tasksDone[task.completionDate])
                tasksDone[task.completionDate] = tasksDone[task.completionDate] + 1;
            else
                tasksDone[task.completionDate] = 1
            
            //Getting Maximum tasks
            if(!maxTasksDate || tasksDone[maxTasksDate] < tasksDone[task.completionDate])
                maxTasksDate = task.completionDate;
        }

        return res.status(200).send(dataResponse("success", {maxTasksDate}));

    }
    catch(error){
        next(error)
    }
}
// Since time of account creation, how many tasks are opened on every day of the week (mon, tue, wed, ....)
const getTasksCreatedDayWise = async(req, res, next) => {
    try{
        let userId = req.user.id;
    }
    catch(error){
        next(error)
    }
}

module.exports = {getTasksStatus, getAverageTasksCompletion, getMaximumTasksCompletionDate, getMissedDeadlineTasks, getTasksCreatedDayWise}
