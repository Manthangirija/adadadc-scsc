const mongoose = require('mongoose');

const UserMoney = new mongoose.Schema({
    email: {
        type: String,
        // required: true
    },

    accountBalance: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }

});


const UserMoneyAdd = mongoose.model('accountBalance', UserMoney);

module.exports = UserMoneyAdd;

