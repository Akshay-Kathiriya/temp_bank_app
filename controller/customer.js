const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const Transaction = require('../models/transaction.js');
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
        const senderAccountNumber = req.body.senderAccountNumber;
        const receiverAccountNumber = req.body.receiverAccountNumber;
        //Transaction insertion
        const transfer = new Transaction({
            senderAccountNumber: senderAccountNumber,
            receiverAccountNumber: receiverAccountNumber,
            type: type,
            amount: {
                [amountType]: req.body.amount
            },
        });
        console.log(transfer);
        console.log("------------------------------------------------------------------------")
        await transfer.save()


        // updating customer data:
        const receiverAccount = await Customer.findOne({
            accountNumber: receiverAccountNumber,
        });
        console.log("receiver sss:", receiverAccount);

        const senderAccount = await Customer.findOne({
            accountNumber: senderAccountNumber,
        });
        console.log("Sender sss", senderAccount);

        if (!receiverAccount) {
            throw new Error("Could not find Receiver Account !!");
        }
        if (!senderAccount) {
            throw new Error("Could not find Sender Account !!");
        }

        let receiverbalance = receiverAccount.balance;
        let senderbalance = senderAccount.balance;
        if (req.body.amount > 0 && senderAccount.balance > req.body.amount) {
            receiverbalance = receiverbalance + req.body.amount;
            senderbalance = senderbalance - req.body.amount;
        } else {
            throw new Error("The account does not have sufficient balance");
        };
        await Customer.updateOne({ accountNumber: receiverAccountNumber }, { $set: { balance: receiverbalance } })
        await Customer.updateOne({ accountNumber: senderAccountNumber }, { $set: { balance: senderbalance } })

        // await receiverAccount.save();
        // await senderAccount.save();
        res.status(200).send({ message: "Transfer successfull!!" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message || "Some internal error occurred !!" });
    }
}

exports.loanrequest = async(req, res) => {
    console.log(req.userId)
    const customerId = req.userId;
    const amount = req.body.amount;
    const period = req.body.period;
    console.log(customerId);
    const loanSchema = new Loan({
        customer: customerId,
        amount,
        period
    });

    await loanSchema.save();
    res.send("Loan is requested.");
}