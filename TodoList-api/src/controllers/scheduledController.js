const createHttpError = require("http-errors")
const db = require('../models/index');
const { sendEmail } = require("../utils/emailHandler");
const { dataResponse } = require("../utils/commonResponse");
const {sequelize, Sequelize:{Op}} = db;
const User = db.users;
const Task = db.tasks;

function tasksEmailTemplate(user){
    let htmlArray = user.tasks.map(
        (task)=>{
            return `
            <div class="task">
            <div class="title">${task.title}</div>
            <div class="description">${task.description}</div>
            <div class="due-date">Due on: ${task.dueDate}</div>
            <div class="completion-status">Status: ${task.completionStatus?"Completed":"Not Completed"}</div>
            </div>
            `
        }
    )

    let htmlTasks = htmlArray.join('\n')

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Due Tasks Reminder</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f4;
        }
        
        .task {
            border: 1px solid #3498db;
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            background-color: #fff;
        }
        
        .title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .description {
            font-size: 14px;
            color: #555;
            margin-bottom: 10px;
        }
        
        .due-date {
            font-size: 12px;
            color: #999;
        }
        
        .completion-status {
            font-size: 12px;
            color: #333;
            font-weight: bold;
        }
        </style>
    </head>
    <body>
        <h1>Due Tasks Reminder</h1>

        <p>Hi there ${user.name}, Here is a reminder of tasks with due date of ${(new Date()).toISOString().split('T')[0]}</p>

        ${htmlTasks}
    </body>
    </html>
    `
}

const sendReminder = async() => {
    let users = await User.findAll({
        attributes: ['name', 'email'],
        // where: {
        //     verified: true
        // },
        include: {
            model: Task,
            attributes: ['title', 'description', 'dueDate', 'fileUrl', 'completionStatus'],
            where: sequelize.where(sequelize.fn('date', sequelize.col('dueDate')), '=', new Date().toISOString().split('T')[0]),
        }
    }).catch((error) => {
        throw new createHttpError.InternalServerError(error);
    })

    for(user of users){
        if(user.tasks && user.tasks.length > 0){
            sendEmail(user.email, "Daily Task Reminder - Emumba Todo List", tasksEmailTemplate(user));
        }
    }
}

module.exports = {sendReminder}