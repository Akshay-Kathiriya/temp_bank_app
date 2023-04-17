const Admin = require("../models/admin");
require("dotenv").config();
const Customer = require("../models/customer");
const Loan = require("../models/loan");
const Transaction = require("../models/transaction");
const ObjectId = require("mongodb").ObjectId;

//It will fetch all customer details from Customer
exports.getCustomerDetails = async (req, res) => {
  try {
    const details = await Customer.find();
    res.status(200).json(details);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

//calculate total amount of all customer
exports.totalAmount = async (req, res) => {
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
exports.loanrequest = async (req, res) => {
  try {
    const loanDetails = await Loan.find();
    res.status(200).send(loanDetails);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
// exports.loanrequesthandler = async(req, res) => {
//     try {
//         const customerId = req.body.id;
//         const loanId = req.body.loanid;
//         const isapproved = req.body.status;
//         const newDetails = {
//             status: isapproved,
//         };
//         if (isapproved === 'approved') {
//             //reflet loan amount in customer schema
//             const id = new ObjectId(customerId).toString();
//             const loan = new ObjectId(loanId).toString();
//             let customerDetails = await Customer.findById({ _id: id });
//             const loanDetails = await Loan.findOne({ _id: loan })
//             if (!customerDetails) throw new Error("Fetching customer details failed.");
//             if (!loanDetails) throw new Error("Fetching Loan Details failed");
//             let balance = customerDetails.balance
//             balance += loanDetails.amount;
//             await Customer.updateOne({ _id: id }, { $set: { balance } })
//                 //update transactions
//             const transaction = new Transaction({
//                 customer: req.userId,
//                 type: 'Loan',
//                 senderAccountNumber: 9999,
//                 receiverAccountNumber: customerDetails.accountNumber,
//                 amount: {
//                     ["debitAmount"]: loanDetails.amount,
//                 },
//                 date: Date.now()
//             })
//             await transaction.save();
//             const updateLoanDetails = await Loan.updateOne({ _id: loan }, { $set: newDetails });
//             if (!updateLoanDetails) {
//                 res.send("Update LoanDetails Failed");
//             }
//             res.send("loan approved.");
//         } else {
//             res.send("loan rejected.")
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send(err.message);
//     }
// };

exports.loanRequestHandler = async (req, res) => {
  try {
    const { id: customerId, loanid: loanId, status: isApproved } = req.body;

    if (!customerId || !loanId || !isApproved) {
      return res.status(400).send("Missing required fields");
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).send("Loan not found");
    }

    if (isApproved === "approved") {
      const newBalance = customer.balance + loan.amount;
      await Customer.updateOne(
        { _id: customerId },
        { $set: { balance: newBalance } }
      );

      const transaction = new Transaction({
        customer: req.userId,
        type: "Loan",
        senderAccountNumber: 9999,
        receiverAccountNumber: customer.accountNumber,
        amount: { debitAmount: loan.amount },
        date: Date.now(),
      });
      await transaction.save();

      const updatedLoan = await Loan.findByIdAndUpdate(loanId, {
        status: isApproved,
      });
      if (!updatedLoan) {
        return res.status(500).send("Failed to update loan status");
      }

      return res.send("Loan approved");
    } else {
      const updatedLoan = await Loan.findByIdAndUpdate(loanId, {
        status: isApproved,
      });
      if (!updatedLoan) {
        return res.status(500).send("Failed to update loan status");
      }

      return res.send("Loan rejected");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

exports.setMaxLoanAmount = async (req, res) => {
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

exports.getAllTransaction = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.send(transactions);
  } catch (err) {
    res.send(err);
  }
};
