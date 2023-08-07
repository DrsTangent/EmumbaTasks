var express = require('express');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')
const {verifyUser, verifyRefreshToken, verifyLocalStrategy} = require('../middlewares/authentication')

/*User Controller Handlers*/
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/sendEmail', verifyUser, verifyLocalStrategy, userController.sendVerificationEmail);
router.get('/verifyEmail', userController.verifyEmail);
router.post('/sendResetPasswordEmail', userController._sendResetPasswordEmail)
router.post('/resetPassword', userController.resetPasssword);
router.post('/setPassword', verifyUser, verifyLocalStrategy, userController.setPassword);
router.get('/myprofile', verifyUser, userController.profile);
router.post('/signout', verifyUser, userController.signout);
router.get('/refreshTokenCall', verifyRefreshToken, userController.refreshTokenCall);
//3rd Party Authentication// Getting Information But not Setting In Model Yet.
//router.get('/oauth-redirect/', userController.oauthRedirect);
router.get('/facebookauth', userController.facebookOAuth);

/*Task Controller Handler*/
router.post('/tasks', verifyUser, taskController.createTask);

// Get all tasks for a specific user
router.get('/tasks', verifyUser, taskController.getAllTasks);

// Get a specific task by ID
router.get('/tasks/:id', verifyUser, taskController.getTaskById);

// Update a task by ID
router.patch('/tasks/:id', verifyUser, taskController.updateTask);

// Delete a task by ID
router.delete('/tasks/:id', verifyUser, taskController.deleteTask);
/*Unused Handlers are given below*/
//router.get('/getUsers', userController.getAllUsers);
//
//router.get('/:id', userController.getSpecificUser);
//router.get('/', userController.getAllUsers);
//router.post('/', userController.addUser);
//router.delete('/:id', userController.deleteUser);
//router.put('/:id', userController.updateUser);

router.get('/createTask', taskController.createTask);


module.exports = router;
