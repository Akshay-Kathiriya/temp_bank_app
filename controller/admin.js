const Admin = require("../models/admin");
require("dotenv").config();
const Customer = require("../models/customer");
const Loan = require("../models/loan");
const Transaction = require("../models/transaction");
const ObjectId = require("mongodb").ObjectId;

//It will fetch all customer details from Customer 
exports.getCustomerDetails = async(req, res) => {
    try {
        const details = await Customer.find();
        res.json(details);
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


exports.loanrequesthandler = async(req, res) => {
    try {
        const customerId = req.body.id;
        const isapproved = req.body.status;

        const newDetails = {
            status: isapproved,
        };


        if (isapproved === 'approved') {

            //reflet loan amount in customer schema
            const id = new ObjectId(customerId).toString();

            let customerDetails = await Customer.findById({ _id: id });
            const loanDetails = await Loan.findOne({ customer: id })

            if (!customerDetails) throw new Error("Fetching customer details failed.");
            if (!loanDetails) throw new Error("Fetching Loan Details failed");

            let balance = customerDetails.balance
            balance += loanDetails.amount;
            await Customer.updateOne({ _id: id }, { $set: { balance } })

            //update transactions
            const transaction = new Transaction({
                customer: req.userId,
                type: 'Loan',
                senderAccountNumber: 9999,
                receiverAccountNumber: customerDetails.accountNumber,
                amount: {
                    ["debitAmount"]: loanDetails.amount,
                },
                date: Date.now()
            })
            await transaction.save();


            const updateLoanDetails = await Loan.updateOne({ customer: customerId }, { $set: newDetails });

            if (!updateLoanDetails) {
                res.send("Update LoanDetails Failed");
            }
            res.send("loan approved.");
        } else {
            res.send("loan rejected.")
        }

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

exports.setMaxLoanAmount = async(req, res) => {
    const maxLoanAmount = req.body.amount;
    const admin = await Admin.updateOne({}, { $set: { maxLoanAmount } });
    console.log(admin);
    const admintemp = await Admin.find();
    console.log(admintemp)
    if (!admin) {
        res.send("Failed.")
    }
    res.send("successfully updated maxLoanAmount");
};

exports.getAllTransaction = async(req, res) => {
    try {
        const transactions = await Transaction.find();
        res.send(transactions);
    } catch (err) {
        res.send(err);
    }
};