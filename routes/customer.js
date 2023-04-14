const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controller/customer')
const User = require('../models/customer');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.post('/signup', [
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
        return Customer.findOne({ email: value }).then(userDoc => {
            if (userDoc) {
                return Promise.reject('E-mail address already exists! ')
            }
        })
    })
    .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('username').trim().not().isEmpty(),
    body('phone_no').isLength({ min: 10 }).isEmpty()
], customerController.signup);
router.post('/Login', customerController.login);


module.exports = router;