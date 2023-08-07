var express = require('express');
var multer = require('multer');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')
const {verifyUser, verifyRefreshToken, verifyLocalStrategy} = require('../middlewares/authentication')
const {uploadFile} = require('../middlewares/upload')

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
router.post('/tasks/:id/file', uploadFile.single("file"), verifyUser,  taskController.uploadFile);// upload an attachment
router.post('/tasks', verifyUser, taskController.createTask);//Create Task
router.get('/tasks', verifyUser, taskController.getAllTasks);// Get all tasks for a specific user
router.get('/tasks/:id', verifyUser, taskController.getTaskById);// Get a specific task by ID
router.patch('/tasks/:id', verifyUser, taskController.updateTask);// Update a task by ID
router.delete('/tasks/:id', verifyUser, taskController.deleteTask);// Delete a task by ID
router.delete('/tasks/:id/file/:filename', verifyUser, taskController.deleteFile); // delete an attachment
/*Unused Handlers are given below*/
//router.get('/getUsers', userController.getAllUsers);
//
//router.get('/:id', userController.getSpecificUser);
//router.get('/', userController.getAllUsers);
//router.post('/', userController.addUser);
//router.delete('/:id', userController.deleteUser);
//router.put('/:id', userController.updateUser);


module.exports = router;
