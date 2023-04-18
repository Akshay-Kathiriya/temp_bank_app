const mongoose = require("mongoose");
const loanSchema = new mongoose.Schema({
    // customer: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Customer",
    //     required: true,
    // },
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    amount: { type: Number,minimum: 0 , required: true },
    period: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
});
module.exports = mongoose.model("Loan", loanSchema);