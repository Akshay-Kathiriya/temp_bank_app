const express = require('express');
const { body } = require('express-validator');
const customerController = require('../controller/customer')
const authController = require('../controller/auth')

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
        body('password').trim().isLength({ min: 3 }),
        body('username').trim().not().isEmpty(),
        body('phone_no').trim().not().isEmpty(),
        body('address').trim().not().isEmpty()
    ],
    authController.Customer_signup);


router.post('/Login', authController.login);

router.get('/getDetails', isAuth, customerController.getDetails);

router.post('/tranferamount', isAuth, customerController.amountTransfer);

router.post('/loanrequest', isAuth, customerController.loanrequest);

router.get('/transactions', isAuth, customerController.transactionDetails);

module.exports = router;