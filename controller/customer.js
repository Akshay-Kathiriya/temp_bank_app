const mongoose = require('mongoose');
const { validationResult } = require("express-validator");
const Customer = require("../models/customer.js");
const Transaction = require("../models/transaction");
const Account = require("../models/account");

const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Loan = require("../models/loan");

exports.getDetails = async(req, res) => {
    try {
        console.log(req.userId);
        const customerDetails = await Customer.findOne({ _id: req.userId });
        return res.status(200).json({
            message: "Home Page",
            customerDetails: customerDetails,
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

exports.createAccount = async(req, res, next) => {
    try {
        function generateAccountNumber() {
            const num = Math.floor(Math.random() * 1000000000000);
            return num;
        }
        const accountNumber = generateAccountNumber();
        const balance = req.body.balance;

        const customerAccount = new Account({
            customer: req.userId,
            accountNumber,
            balance
        });
        await customerAccount.save();

        res.status(201).json({
            message: 'Account created!',
        })
    } catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        next(err);
    }

};

exports.amountTransfer = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { accountId, accountNumber, amount } = req.body;
        // const statustype = type === "debit" ? "credit" : "debit";
        // const amountType = type === "debit" ? "debitAmount" : "creditAmount";

        // const senderAccount = await Customer.findOne({ _id: req.userId });
        const receiverAccount = await Account.findOne({ accountNumber }, null, { session });

        if (!receiverAccount) {
            return res.status(200).send("Account not found.")
        }

        const senderAccount = await Account.findOne({ _id: accountId }, null, { session });

        if (!senderAccount) {
            return res.status(200).send("Account not found.")
        }

        // Insert transaction
        const transfer = new Transaction({
            customer: req.userId,
            type: "credit",
            AccountNumber: accountNumber,
            amount,
        });
        const transferDetails = await transfer.save({ session });
        if (!transferDetails) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).send("Failed to create transfer at sender side and should be aborted.");
        }
        // Insert transaction for receiver
        const transferAtReceiver = new Transaction({
            customer: receiverAccount._id,
            type: "debit",
            AccountNumber: senderAccount.accountNumber,
            amount,
        });
        const rtransferDetails = await transferAtReceiver.save({ session });
        if (!rtransferDetails) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).send("Failed to create transfer at receiver and should be aborted.");
        }
        // Update sender and receiver balances
        const senderBalanceAfterTransfer = senderAccount.balance - amount;
        if (senderBalanceAfterTransfer < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(201).send("The account does not have sufficient balance");
        }

        const accountUpdateAtReceiver = await Account.updateOne({ accountNumber: accountNumber }, { $inc: { balance: amount } }, { session });
        if (accountUpdateAtReceiver.modifiedCount !== 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).send("Failed to update account at receiver  and should be aborted.");
        }

        const accountUpdateAtSender = await Account.updateOne({ accountNumber: senderAccount.accountNumber }, { $inc: { balance: -amount } }, { session });
        if (accountUpdateAtSender.modifiedCount !== 1) {
            await session.abortTransaction();
            session.endSession();
            return res.status(500).send("Failed to update account at sender  and should be aborted.");
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).send({ message: "Transfer successful!!" });
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Internal Server Error");
    }
};

exports.transactionDetails = async(req, res) => {
    try {
        const customer = req.userId;
        const transactions = await Transaction.find({ customer });
        if (!transactions) {
            res.status(200).send("There is no transaction from your account");
        }
        res.status(200).send(transactions);
    } catch (error) {
        console.log(error);
        reS.status(500).send({ message: error.message || "Some internal error occurred !!" });
    }
};

exports.loanrequest = async(req, res) => {
    try {
        const customerId = req.userId;
        const amount = req.body.amount;
        const period = req.body.period;

        const admin = await Admin.findOne();
        if (!admin) {
            throw new Error("No admin found.");
        }
        const maxLoanAmount = admin.maxLoanAmount;
        if (amount > maxLoanAmount) {
            throw new Error(`You can get maxLoanAmount upto ${maxLoanAmount}`);
        }

        const loanSchema = new Loan({
            customer: customerId,
            amount,
            period,
            admin: admin._id,
        });

        await loanSchema.save();
        res.status(200).send("Loan is requested.");

    } catch (err) {
        res.status(500).send({ message: err.message || "Some internal error occurred !!" });
    }
};

exports.loanDetails = async(req, res) => {
    try {
        const customer = req.userId;
        const loanTransactions = await Loan.find({ customer });
        if (!loanTransactions) {
            res.status(200).send("There is no loan requested from your account");
        }
        res.status(200).send(loanTransactions);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message || "Some internal error occurred !!" });
    }
};