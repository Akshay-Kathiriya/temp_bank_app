const Admin = require("../models/admin");
require("dotenv").config();
const Customer = require("../models/customer");
const Loan = require("../models/loan");
const Transaction = require("../models/transaction");
const ObjectId = require("mongodb").ObjectId;
const mongoose = require('mongoose');
const Account = require('../models/account')
//It will fetch all customer details from Customer
exports.getCustomerDetails = async(req, res) => {
    try {
        const details = await Customer.find();
        res.status(200).json(details);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

//calculate total amount of all customer
exports.totalAmount = async(req, res) => {
    try {
        let total = 0;
        const details = await Customer.find();
        for (let i = 0; i < details.length; i++) {
            total += details[i].balance;
        }
        res.status(200).send({ total });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

//Fetch all loan request from loan table.
exports.loanrequest = async(req, res) => {
    try {
        const loanDetails = await Loan.find();
        res.status(200).send(loanDetails);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

exports.loanRequestHandler = async(req, res) => {
     const session = await mongoose.startSession();
     session.startTransaction();
    try {
        
        const { id: customerId, loanid: loanId, status: isApproved } = req.body;

        if (!customerId || !loanId || !isApproved) {
            return res.status(400).send("Missing required fields");
        }

        const customer = await Customer.findById(customerId, null, { session });
        if (!customer) {
            return res.status(404).send("Customer not found");
        }

        const loan = await Loan.findById(loanId, null, { session });
        if (!loan) {
            return res.status(404).send("Loan not found");
        }

        if (isApproved === "approved") {
            const newBalance = customer.balance + loan.amount;
            await Customer.updateOne({ _id: customerId }, { $set: { balance: newBalance } }, {session});
            const transaction = new Transaction({
                customer: req.userId,
                type: "loanDebit",
                AccountNumber: customer.accountNumber,
                amount:  loan.amount ,
                date: Date.now(),
            });
            await transaction.save({session});

            const endDate = Date.now() + loan.period;
            const updatedLoan = await Loan.updateOne({_id:loanId}, {
                status: isApproved,
                startDate: Date.now(),
                endDate
            },{session});
            if (updatedLoan.modifiedCount!==1) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Failed to update loan status  and should be aborted.");
            }

            await session.commitTransaction();
            session.endSession();
            return res.send("Loan approved");
        } else {
            const updatedLoan = await Loan.updateOne({_id:loanId}, {
                status: isApproved,
            }, {session});
            if (!updatedLoan) {
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Failed to update loan status");
            }
            await session.commitTransaction();
            session.endSession();
            return res.send("Loan rejected");
        }
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).send("Internal Server Error");
    }
};

exports.setMaxLoanAmount = async(req, res) => {
    try {
        const { amount } = req.body;
        const update = { maxLoanAmount: amount };
        const admin = await Admin.updateOne({}, update);
        console.log(admin);
        if (!admin) {
            return res.status(404).send("Admin document not found.");
        }
        res.send("Successfully updated maxLoanAmount.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error.");
    }
};

exports.getAllTransaction = async(req, res) => {
    try {
        const transactions = await Transaction.find();
        res.send(transactions);
    } catch (err) {
        res.send(err);
    }
};


exports.bankAccount = async(req, res)=>{
    function generateAccountNumber() {
        const num = Math.floor(Math.random() * 1000000000000);
        return num;
    }
    const accountNumber = generateAccountNumber();
    const account = new Account({
        accountNumber,
        admin:req.userId
    })

    await account.save();
    res.send("Account generated.")
}