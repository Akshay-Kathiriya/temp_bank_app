const { validationResult } = require("express-validator");
const Customer = require("../models/customer.js");
const Transaction = require("../models/transaction.js");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin.js");
const Loan = require("../models/loan.js");

exports.getDetails = async(req, res) => {
    try {
        console.log(req.userId);
        const account = await Customer.findOne({ _id: req.userId });
        return res.status(200).json({
            message: "Home Page",
            account: account,
        });
    } catch (err) {
        return res.status(500).send(err);
    }
};

// exports.amountTransfer = async(req, res) => {
//     try {
//         const type = req.body.type;
//         let statustype;
//         if (type === "debit") {
//             statustype = "credit"
//         } else {
//             statustype = "debit"
//         }

//         let amountType;
//         if (type === "debit") {
//             amountType = "debitAmount";
//         } else {
//             amountType = "creditAmount";
//         }

//         console.log("userId:", req.userId);

//         const senderAccountNumber = req.body.senderAccountNumber;
//         const receiverAccountNumber = req.body.receiverAccountNumber;
//         const account = await Customer.findOne({ _id: req.userId });
//         const rAccount = await Customer.findOne({ accountNumber: receiverAccountNumber });
//         if (account.accountNumber !== senderAccountNumber) {
//             throw new Error("Invalid Sender A/c Number!!");
//         }

//         //Transaction insertion
//         const transfer = new Transaction({
//             customer: req.userId,
//             senderAccountNumber: senderAccountNumber,
//             receiverAccountNumber: receiverAccountNumber,
//             type: type,
//             amount: {
//                 [amountType]: req.body.amount,
//             },
//         });

//         await transfer.save();

//         amountType = amountType === "debitAmount" ? "creditAmount" : "debitAmount"

//         const transferAtrec = new Transaction({

//             customer: rAccount._id,
//             senderAccountNumber: senderAccountNumber,
//             receiverAccountNumber: receiverAccountNumber,
//             type: statustype,
//             amount: {
//                 [amountType]: req.body.amount,
//             },

//         })
//         console.log("-------------------------------------------------------------", transferAtrec);


//         await transferAtrec.save();


//         // updating customer data:
//         const receiverAccount = await Customer.findOne({
//             accountNumber: receiverAccountNumber,
//         });
//         console.log("receiver sss:", receiverAccount);

//         const senderAccount = await Customer.findOne({
//             accountNumber: senderAccountNumber,
//         });
//         console.log("Sender sss", senderAccount);

//         if (!receiverAccount) {
//             throw new Error("Could not find Receiver Account !!");
//         }
//         if (!senderAccount) {
//             throw new Error("Could not find Sender Account !!");
//         }

//         let receiverbalance = receiverAccount.balance;
//         let senderbalance = senderAccount.balance;
//         if (req.body.amount > 0 && senderAccount.balance > req.body.amount) {
//             receiverbalance = receiverbalance + req.body.amount;
//             senderbalance = senderbalance - req.body.amount;
//         } else {
//             throw new Error("The account does not have sufficient balance");
//         }
//         await Customer.updateOne({ accountNumber: receiverAccountNumber }, { $set: { balance: receiverbalance } });
//         await Customer.updateOne({ accountNumber: senderAccountNumber }, { $set: { balance: senderbalance } });

//         res.status(200).send({ message: "Transfer successfull!!" });
//     } catch (error) {
//         console.log(error);
//         res
//             .status(500)
//             .send({ message: error.message || "Some internal error occurred !!" });
//     }
// };


exports.amountTransfer = async(req, res) => {
    try {
        const { type, senderAccountNumber, receiverAccountNumber, amount } = req.body;
        const statustype = type === "debit" ? "credit" : "debit";
        const amountType = type === "debit" ? "debitAmount" : "creditAmount";

        const account = await Customer.findOne({ _id: req.userId });
        const rAccount = await Customer.findOne({ accountNumber: receiverAccountNumber });

        if (account.accountNumber !== senderAccountNumber) {
            throw new Error("Invalid Sender A/c Number!!");
        }

        // Insert transaction
        const transfer = new Transaction({
            customer: req.userId,
            senderAccountNumber,
            receiverAccountNumber,
            type,
            amount: {
                [amountType]: amount,
            },
        });
        await transfer.save();

        // Insert transaction for receiver
        const transferAtrec = new Transaction({
            customer: rAccount._id,
            senderAccountNumber,
            receiverAccountNumber,
            type: statustype,
            amount: {
                [amountType === "debitAmount" ? "creditAmount" : "debitAmount"]: amount,
            },
        });
        await transferAtrec.save();

        // Update sender and receiver balances
        const receiverAccount = await Customer.findOne({ accountNumber: receiverAccountNumber });
        const senderAccount = await Customer.findOne({ accountNumber: senderAccountNumber });

        if (!receiverAccount || !senderAccount) {
            throw new Error("Could not find account");
        }

        const senderBalanceAfterTransfer = senderAccount.balance - amount;
        if (senderBalanceAfterTransfer < 0) {
            throw new Error("The account does not have sufficient balance");
        }

        await Customer.updateOne({ accountNumber: receiverAccountNumber }, { $inc: { balance: amount } });
        await Customer.updateOne({ accountNumber: senderAccountNumber }, { $inc: { balance: -amount } });

        res.status(200).send({ message: "Transfer successful!!" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Some internal error occurred !!" });
    }
};

exports.transactionDetails = async(req, res) => {
    try {
        const customer = req.userId;
        const transactions = await Transaction.find({ customer });
        if (!transactions) {
            throw new error("failed");
        }
        res.status(200).send(transactions);
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .send({ message: error.message || "Some internal error occurred !!" });
    }
};

exports.loanDetails = async(req, res) => {
    try {
        const customer = req.userId;
        const loanTransactions = await Loan.find({ customer });
        if (!loanTransactions) {
            throw new error("There is no loan");
        }
        res.status(200).send(loanTransactions);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message || "Some internal error occurred !!" });
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
        res.send("Loan is requested.");
    } catch (err) {
        res
            .status(500)
            .send({ message: err.message || "Some internal error occurred !!" });
    }
};