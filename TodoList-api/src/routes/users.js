var express = require('express');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')


/*User Controller Handlers*/
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/getUsers', userController.getAllUsers);
router.post('/sendEmail', userController.sendVerificationEmail);
router.get('/verifyEmail', userController.verifyEmail);
router.post('/sendResetPassword', userController.sendResetPasswordEmail)
router.post('/resetPassword', userController.resetPasssword);

router.get('/createTask', taskController.createTask);


module.exports = router;
