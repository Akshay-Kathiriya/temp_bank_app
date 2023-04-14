const express = require('express');
// const { body } = require('express-validator');
const adminController = require('../controller/admin')
const User = require('../models/customer');
const router = express.Router();
// const isAuth = require('../middleware/is-auth');

router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
module.exports = router;