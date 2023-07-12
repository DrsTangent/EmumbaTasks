const db = require('../models/index');
const Task = db.tasks;
const Op = db.Sequelize.Op;

function createTask(req, res){
    Task.create(req.body).then(
        data=>{
            res.send(data);
        }
    ).catch(err=>{
        console.log(err);
        res.status(500).send('Error in Server');
    })
}

module.exports = {createTask}