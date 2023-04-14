const express = require('express');
// const { body } = require('express-validator');
const adminController = require('../controller/admin')
const authController = require('../controller/auth')

const User = require('../models/customer');
const router = express.Router();
// const isAuth = require('../middleware/is-auth');

router.post('/signup', authController.Admin_signup);
router.post('/login', authController.login);
module.exports = router;