const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const bcrypt = require('bcryptjs');

exports.getDetails = async(req, res) => {

    // if (!req.params.customer) res.status(400).send('Invalid User')

    try {
        const account = await Customer.findOne({ _id: req.userId })
        return res.status(200).send(account)
    } catch (err) {
        return res.status(500).send(err)
    }
}

exports.deposit = async(req, res) => {

    const account = await Customer.findOne({ accountNumber: req.body.accountNumber })
    const valueBeforeDeposit = parseInt(account.balance)
    const valueAfterDeposit = valueBeforeDeposit + req.body.balance

    try {
        await Customer.updateOne({ account: req.body.account }, { value: valueAfterDeposit })
        return res.status(200).json({ msg: 'Deposited Suucessfully' })
    } catch (error) {
        return res.status(500).json({ msg: 'Something went wrong' })
    }
}