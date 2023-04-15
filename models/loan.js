const mongoose = require("mongoose");
const loanSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    amount: { type: Number, required: true },
    period: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
});
module.exports = mongoose.model("loan", loanSchema);