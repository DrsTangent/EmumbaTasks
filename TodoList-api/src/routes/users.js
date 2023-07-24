var express = require('express');
var router = express.Router();
var taskController = require('../controllers/taskController')
var userController = require('../controllers/userController')


/*User Controller Handlers*/
router.get('/oauth-redirect/', userController.oauthRedirect);
router.get('/facebookauth', userController.facebookOAuth);
router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/getUsers', userController.getAllUsers);
router.post('/sendEmail', userController.sendVerificationEmail);
router.get('/verifyEmail', userController.verifyEmail);
router.post('/sendResetPasswordEmail', userController._sendResetPasswordEmail)
router.post('/resetPassword', userController.resetPasssword);
router.post('/setPassword', userController.setPassword);
router.get('/me', userController.profile);
router.post('/refreshTokenCall', userController.refreshTokenCall);
router.post('/signout', userController.signout);

router.get('/:id', userController.getSpecificUser);
router.get('/', userController.getAllUsers);

router.post('/', userController.addUser);
router.delete('/:id', userController.deleteUser);
router.put('/:id', userController.updateUser);

router.get('/createTask', taskController.createTask);


module.exports = router;
