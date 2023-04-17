const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controller/admin')
const authController = require('../controller/auth')
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
    body('name').trim().not().isEmpty()
], authController.Admin_signup);

router.post('/login', [
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
    body('password').trim().isLength({ min: 3 })
], authController.login);

router.get('/getCustomerDetails', isAuth, adminController.getCustomerDetails);

router.get('/total', isAuth, adminController.totalAmount);

router.get('/loanRequest', isAuth, adminController.loanrequest);

router.post('/isApproved', isAuth, adminController.loanRequestHandler);

router.post('/setMaxLoanAmount', [body('amount').isNumeric().withMessage('Amount must be numeric')], isAuth, adminController.setMaxLoanAmount);

router.get('/allTransactions', isAuth, adminController.getAllTransaction);

module.exports = router;