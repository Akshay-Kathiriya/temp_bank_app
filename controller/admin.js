const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();
const Customer = require("../models/customer");
const secretKey = process.env.TOKEN_SECRET_KEY;
const Loan = require("../models/loan");
const Transaction = require("../models/transaction");
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
        const loanDetails = await Loan.find();
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
            console.log(id)
            let customerDetails = await Customer.findById({ _id: id });
            // console.log(customerDetails);
            const loanDetails = await Loan.findOne({ customer: id })
                // console.log(loanAmount);
            if(!customerDetails) throw new Error("Fetching customer details failed.");
            if(!loanDetails) throw new Error("Fetching Loan Details failed");

            let balance = customerDetails.balance
            balance += loanDetails.amount;
            // console.log(balance)
            await Customer.updateOne({ _id: id }, { $set: { balance } })
                // let customerDetails1 = await Customer.findById({ _id: id });
                // console.log(customerDetails1);
                //update transactions
            const transaction = new Transaction({
                customer:req.userId,
                type: 'Loan',
                senderAccountNumber: 9999,
                receiverAccountNumber: customerDetails.accountNumber,
                amount: {
                    ["debitAmount"]: loanDetails.amount,
                },
                date: Date.now()
            })
            // console.log(transaction)
            // console.log("------------------------------------------")
            await transaction.save();
          
            // console.log("after transaction")
           
         
              const updateLoanDetails = await Loan.updateOne({ customer: customerId }, { $set: newDetails });
    
            if (!updateLoanDetails) {
                res.send("Failed");
            }
            res.send("loan approved.");
        } else{
            res.send("loan rejected.")
        }
     
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

exports.setMaxLoanAmount = async (req, res)=>{
    const maxLoanAmount = req.body.amount;
    
    const admin = await Admin.updateOne({},{$set:{maxLoanAmount}});
    console.log(admin);
    const admintemp = await Admin.find();
    console.log(admintemp)
    if(!admin){
        res.send("Failed.")
    }
    res.send("successfully updated maxLoanAmount");
}

exports.getAllTransaction = async (req, res)=>{
    try{
        const transactions = await Transaction.find();
        res.send(transactions);
    }catch(err){
        res.send(err);
    }
}

//loadaproval name, email,loanamount, balance,
// http://local.../loanrequst
// name,email,loanamount
// http://lacal.../loanresponse

// reject or approved

