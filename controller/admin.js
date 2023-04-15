const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
const Customer = require("../models/customer");
const secretKey = process.env.TOKEN_SECRET_KEY;
const loan = require("../models/loan");
const Transaction = require("../models/customer");
const ObjectId = require("mongodb").ObjectId;
exports.getCustomerDetails = async(req, res) => {
    try {
        //we can add below code separately using middleware authenticationtoken
        // const token = req.body.token;
        // const adminDetails = jwt.verify(token, secretKey);
        const details = await Customer.find();
        res.json(details);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};
exports.totalAmount = async(req, res) => {
    try {
        let total = 0;
        const details = await Customer.find();
        // const items = JSON.stringify(details)
        console.log(details[0].balance);
        //    details.reduce(item=>{
        //         console.log(typeof item.balance)
        //         total+=item.balance;
        //     })
        for (let i = 0; i < details.length; i++) {
            total += details[i].balance;
        }
        res.status(200).send({ total });
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};
exports.loanrequest = async(req, res) => {
    try {
        const loanDetails = await loan.find();
        res.status(200).send(loanDetails);
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};
exports.isapprove = async(req, res) => {
    //loanrequesthandler
    try {
        const customerId = req.body.id;
        const isapproved = req.body.status;
        // ["pending", "approved", "rejected"]
        const newDetails = {
            status: isapproved,
        };
        // console.log("ID : ", typeof customerId);
        //approved
        if (isapproved === 'approved') {
            //reflet loan amount in customer schema
            const id = new ObjectId(customerId).toString();
            let customerDetails = await Customer.findById({ _id: id });
            // console.log(customerDetails);
            const loanAmount = await loan.findOne({ customer: id })
                // console.log(loanAmount);
            let balance = customerDetails.balance
            balance += loanAmount.amount;
            // console.log(balance)
            await Customer.updateOne({ _id: id }, { $set: { balance } })
                // let customerDetails1 = await Customer.findById({ _id: id });
                // console.log(customerDetails1);
                //update transactions
            const transaction = new Transaction({
                type: 'Loan',
                senderAccountNumber: 0,
                receiverAccountNumber: customerDetails.accountNumber,
                amount: [{
                    debitAmount: loanAmount,
                }],
                date: Date.now()
            })
            await transaction.save();
            console.log("after transaction")
                //reject
                //
            let updateLoanDetails;
            if (isapproved === "approved") {
                updateLoanDetails = await loan.updateOne({ customer: customerId }, { $set: newDetails });
            } else {}
            if (!updateLoanDetails) {
                res.send("Failed");
            }
        } else {}
        res.send("Updated.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }
};

//loadaproval name, email,loanamount, balance,
// http://local.../loanrequst
// name,email,loanamount
// http://lacal.../loanresponse

// reject or approved

