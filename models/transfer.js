const mongoose = require('mongoose');

const transferSchema = mongoose.Schema({
    depositAccountNumber: {
        type: Number,
        required: true
    },
    withdrawAccountNumber: {
        type: Number,
        required: true
    },
    transactionBalance: Number

});

module.exports = mongoose.model('Tranfer', transferSchema);