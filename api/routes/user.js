const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');

const userController = require('../controlles/user');

router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/', checkAuth, userController.getUserList);

router.delete('/:userId', checkAuth, userController.deleteUser);

module.exports = router;