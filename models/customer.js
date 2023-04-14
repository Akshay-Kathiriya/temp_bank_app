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
        unique: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    transactions: [{
        type: { type: String, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, required: true, default: Date.now },
    }, ],
});

module.exports = mongoose.model("Customer", customerSchema);