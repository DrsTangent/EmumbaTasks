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
            attributes: ['name', 'email', 'createdAt'],
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
            having: sequelize.fn('COUNT', sequelize.col('tasks.id'))
        }).catch((error) => {
            throw new createHttpError.InternalServerError(error);
        })

        let totalTasks = user.tasks.length;
        let toDayUnix = new Date().getTime();
        let createdUserUnix = new Date(user.createdAt).getTime()
        let miliSecTimeDiff = toDayUnix - createdUserUnix;
        let dayTimeDiff = miliSecTimeDiff/(1000*60*60*24);
        let averageTasksPerDay = totalTasks/dayTimeDiff;

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

        return res.status(200).send(dataResponse("success", {maxTasksDate, tasksNo: tasksDone[maxTasksDate]}));

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
            attributes:["createdAt"]
        }).catch((error)=>{
            throw new createHttpError.InternalServerError(error);
        });
        
        tasksCompletion = {
            "Mon": 0,
            "Tue": 0,
            "Wed": 0,
            "Thu": 0,
            "Fri": 0,
            "Sat": 0,
            "Sun": 0
        };

        for(task of tasks){
            day = new Date(task.createdAt).getDay();
            
            switch(day){
                case 0:
                    tasksCompletion["Sun"] = tasksCompletion["Sun"] + 1;
                    break;
                case 1:
                    tasksCompletion["Mon"] = tasksCompletion["Mon"] + 1;
                    break;
                case 2:
                    tasksCompletion["Tue"] = tasksCompletion["Tue"] + 1;
                    break;
                case 3:
                    tasksCompletion["Wed"] = tasksCompletion["Wed"] + 1;
                    break;
                case 4:
                    tasksCompletion["Thu"] = tasksCompletion["Thu"] + 1;
                    break;
                case 5:
                    tasksCompletion["Fri"] = tasksCompletion["Fri"] + 1;
                    break;
                case 6:
                    tasksCompletion["Sat"] = tasksCompletion["Sat"] + 1;
                    break;
            }
        }

        return res.status(200).send(dataResponse("success", {tasksCompletion}))
    }
    catch(error){
        next(error)
    }
}

module.exports = {getTasksStatus, getAverageTasksCompletion, getMaximumTasksCompletionDate, getMissedDeadlineTasks, getTasksCreatedDayWise}
