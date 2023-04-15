const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')
const path = require('path');
require('dotenv').config();
const secretKey = process.env.TOKEN_SECRET_KEY;


exports.getCustomerDetails = async(req, res) => {

    try {
        //we can add below code separately using middleware authenticationtoken
        // const token = req.body.token;
        // const adminDetails = jwt.verify(token, secretKey); 
        const details = await Customer.find();
        res.json(details);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}


exports.totalAmount = async(req, res) => {
    try {
        let total = 0;
        const details = await Customer.find();
        // const items = JSON.stringify(details)
        console.log(details[0].balance)
            //    details.reduce(item=>{
            //         console.log(typeof item.balance)
            //         total+=item.balance;
            //     })

        for (let i = 0; i < details.length; i++) {
            total += details[i].balance
        }
        res.status(200).send({ total });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
}

exports.loanrequest = async(req, res) => {
    try {
        res.status(200).send({ approved: 'yes' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
}