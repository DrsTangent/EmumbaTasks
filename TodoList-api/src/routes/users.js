var express = require('express');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')
const scheduledController = require('../controllers/scheduledController');
const reportController = require('../controllers/reportController');
const {verifyUser, verifyRefreshToken, verifyLocalStrategy} = require('../middlewares/authentication')
const {uploadFile} = require('../middlewares/upload')


router.patch('/tasks/:id', verifyUser, taskController.updateTask);// Update a task by ID
/*User Controller Handlers*/
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/sendEmail', verifyUser, verifyLocalStrategy, userController.sendVerificationEmail);
router.get('/verifyEmail', userController.verifyEmail);
router.post('/sendResetPasswordEmail', userController._sendResetPasswordEmail)
router.post('/resetPassword', userController.resetPasssword);
router.post('/setPassword', verifyUser, verifyLocalStrategy, userController.setPassword);
router.get('/myprofile', verifyUser, userController.profile);
router.get('/signout', verifyUser, userController.signout);
router.get('/refreshTokenCall', verifyRefreshToken, userController.refreshTokenCall);
//3rd Party Authentication// Getting Information But not Setting In Model Yet.
//router.get('/oauth-redirect/', userController.oauthRedirect);
router.get('/facebookauth', userController.facebookOAuth);

/*Task Controller Handler*/

router.get('/tasks/getSimilarTasks', verifyUser, taskController.getSimilarTasks)
router.post('/tasks/:id/file', verifyUser, uploadFile.single("file"),  taskController.uploadFile);// upload an attachment
router.post('/tasks', verifyUser, taskController.createTask);//Create Task
router.get('/tasks', verifyUser, taskController.getAllTasks);// Get all tasks for a specific user
router.get('/tasks/:id', verifyUser, taskController.getTaskById);// Get a specific task by ID
router.delete('/tasks/:id', verifyUser, taskController.deleteTask);// Delete a task by ID
router.delete('/tasks/:id/file/', verifyUser, taskController.deleteFile); // delete an attachment

/*Report Controller Handler*/
router.get('/report/getTasksStatus', verifyUser, reportController.getTasksStatus);
router.get('/report/getAverageTasksCompletion', verifyUser, reportController.getAverageTasksCompletion);
router.get('/report/getMaximumTasksCompletionDate', verifyUser, reportController.getMaximumTasksCompletionDate);
router.get('/report/getMissedDeadlineTasks', verifyUser, reportController.getMissedDeadlineTasks);
router.get('/report/getTasksCreatedDayWise', verifyUser, reportController.getTasksCreatedDayWise);

/*Schedule Tasks Controller*/
router.get('/test', scheduledController.sendReminder);

/*Unused Handlers are given below*/
//router.get('/getUsers', userController.getAllUsers);
//router.get('/:id', userController.getSpecificUser);
//router.get('/', userController.getAllUsers);
//router.post('/', userController.addUser);
//router.delete('/:id', userController.deleteUser);
//router.put('/:id', userController.updateUser);


module.exports = router;
