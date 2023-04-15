const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone_no: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: Number,
        required: true,
        // unique: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },

}, { timestamps: true });

// const transactionSchema = new mongoose.Schema({
//     type: { type: String, required: true },
//     senderAccountNumber: { type: Number, required: true },
//     receiverAccountNumber: { type: Number, required: true },
//     amount: {
//         debitAmount: { type: Number, required: true, default: 0 },
//         creditAmount: { type: Number, required: true, default: 0 },
//     },
//     date: { type: Date, required: true, default: Date.now }
// });

module.exports = mongoose.model("Customer", customerSchema);
// module.exports.Transaction = mongoose.model("Transaction", transactionSchema);