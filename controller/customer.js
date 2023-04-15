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
    try {
        const type = req.body.type;
        let amountType;
        if (type === "debit") {
            amountType = "debitAmount";
        } else {
            amountType = "creditAmount";
        }
        //Transaction insertion
        const transfer = new Transaction({
            senderAccountNumber: req.body.senderAccountNumber,
            receiverAccountNumber: req.body.receiverAccountNumber,
            type: type,
            amount: {
                [amountType]: req.body.amountType
            },
        });
        console.log(
            transfer.receiverAccountNumber +
            " " +
            transfer.senderAccountNumber +
            " " +
            transfer.amount
        );

        // updating customer data:
        const receiverAccount = await Customer.findOne({
            accountNumber: transfer.receiverAccountNumber,
        });
        console.log(receiverAccount);

        const senderAccount = await Customer.findOne({
            accountNumber: transfer.senderAccountNumber,
        });
        console.log(senderAccount);

        if (!receiverAccount) {
            throw new Error("Could not find Receiver Account !!");
        }
        if (!senderAccount) {
            throw new Error("Could not find Sender Account !!");
        }

        if (transfer.amount > 0 && senderAccount.balance > transfer.amount) {
            receiverAccount.balance = receiverAccount.balance + transfer.amount;
            senderAccount.balance = senderAccount.balance - transfer.amount;
        } else {
            throw new Error("The account does not have sufficient balance");
        }
        await receiverAccount.save();
        await senderAccount.save();
        res.status(200).send({ message: "Transfer successfull!!" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message || "Some internal error occurred !!" });
    }
};