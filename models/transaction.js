const mongoose = require("mongoose");
const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true },
    senderAccountNumber: { type: Number, required: true },
    receiverAccountNumber: { type: Number, required: true },
    amount: [{
        debitAmount: { type: Number, required: true, default: 0 },
        creditAmount: { type: Number, required: true, default: 0 },
    }],
    date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);