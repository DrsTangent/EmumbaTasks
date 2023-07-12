var express = require('express');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')
/* GET users listing. */
router.post('/createUser', userController.createUser);


router.get('/createTask', taskController.createTask);


module.exports = router;
