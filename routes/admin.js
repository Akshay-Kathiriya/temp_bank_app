const express = require('express');
// const { body } = require('express-validator');
const adminController = require('../controller/admin')
const authController = require('../controller/auth')

const User = require('../models/customer');
const admin = require('../models/admin');
const router = express.Router();
const isAuth = require('../middleware/is-auth');


router.post('/signup', authController.Admin_signup);
router.post('/login', authController.login);
router.get('/getCustomerDetails', isAuth, adminController.getCustomerDetails);
router.get('/total', isAuth, adminController.totalAmount);
router.get('/loanrequest', isAuth, adminController.loanrequest);
router.post('/isapproved/', isAuth, adminController.isapprove);
router.post('/setMaxLoanAmount', isAuth, adminController.setMaxLoanAmount);
router.get('/allTransactions', isAuth, adminController.getAllTransaction);
module.exports = router;