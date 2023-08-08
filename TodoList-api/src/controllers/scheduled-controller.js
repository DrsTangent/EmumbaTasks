const createHttpError = require("http-errors")
const db = require('../models/index');
const { sendEmail } = require("../utils/emailHandler");
const {sequelize, Sequelize:{Op}} = db;
const User = db.users;
const Task = db.tasks;

const sendReminder = async() => {
    let users = await User.findAll({
        attributes: ['name', 'email'],
        where: {
            emailVerifiedAt: true
        },
        include: {
            model: Task,
            attributes: ['title', 'description', 'dueDate', ]
        }
    })

    sendEmail(users.email, "Subject", "Body of Email, Listing the Tasks most probably")
}