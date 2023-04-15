const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const Transaction = require('../models/customer');
const bcrypt = require('bcryptjs');

exports.getDetails = async(req, res) => {

    // if (!req.params.customer) res.status(400).send('Invalid User')

    try {
        console.log(req.params.id);
        const account = await Customer.findOne({ _id: req.params.id })
        console.log(account);
        return res.status(200)
            .json({
                message: "Home Page",
                account: account
            })
    } catch (err) {
        return res.status(500).send(err)
    }
}


exports.amountTransfer = async(req, res) => {
    const type = req.body.type;
    let amountType;
    if (type === "debit") {
        amountType = "debitAmount"
    } else {
        amountType = "creditAmount"
    }
    const transfer = new Transaction({
        senderAccountNumber: req.body.senderAccountNumber,
        receiverAccountNumber: req.body.receiverAccountNumber,
        type: type,
        amount: { amountType: req.body.amountType }
    });
    console.log(transfer.receiverAccountNumber + " " + transfer.senderAccountNumber + " " + transfer.amount);
    var receiverAccount;
    var senderAccount;

    try {
        const account = await Customer.findOne({
            'accountNumber': transfer.receiverAccountNumber
        })
        receiverAccount = account;
        console.log(receiverAccount);
        receiverAccount.balance = receiverAccount.balance + transfer.amount;
        const data = await receiverAccount.save();
        try {
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send({ message: error.message || "Some internal error occurred !!" });
        }
    } catch (error) {
        console.log(error);
    }

    try {
        const account = await Customer.findOne({
            'accountNumber': transfer.senderAccountNumber
        });
        senderAccount = account;
        console.log(senderAccount);
        if (null != transfer.amount && undefined != transfer.amount &&
            transfer.amount > 0) {
            if (senderAccount.balance > transfer.amount) {
                senderAccount.balance = senderAccount.balance - transfer.amount;
            } else {
                res.status(400).send({ message: "The account does not have sufficient balance" });
            }
        } else {
            res.status(400).send({ message: "Invalid input !!" });
        }
        const data = await senderAccount.save();
        try {
            res.status(200).send(data);
        } catch (error) {
            res.status(500).send({ message: error.message || "Some internal error occurred !!" });
        }
    } catch (error) {
        console.log(error);
    }
}