const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const bcrypt = require('bcryptjs');
const Loan = require('../models/loan.js')
const isAuth = require('../middleware/is-auth.js')

exports.loanrequest =async (req, res)=>{
    console.log(req.userId)
    const customerId = req.userId;
    const amount = req.body.amount;
    const period = req.body.period;
    console.log(customerId);
    const loanSchema = new Loan({
        customer:customerId,
        amount,
        period
    });

    await loanSchema.save();
    res.send("Loan is requested.");
}