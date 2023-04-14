const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const bcrypt = require('bcryptjs');

exports.signup = async(req, res, next) => {
    function generateAccountNumber() {
        let num = ''
        while (num.length < 4) {
            num += Math.floor(Math.random() * 10)
        }
        return num

    }
    const accountNumber = generateAccountNumber()
        /*  const errors = validationResult(req);
         if (!errors.isEmpty()) {
             const error = new Error('Validation failed.');
             error.statusCode = 422;
             error.data = errors.array();
             throw error;
         } */
    let userToCreate = {
        accountNumber: accountNumber,
        balance: 0,
        username: req.body.username,
        email: req.body.email,
        phone_no: req.body.phone_no,
        address: req.body.address,
        password: req.body.password

    }
    bcrypt.hash(userToCreate.password, 12)
        .then(hashedPw => {
            const user = new Customer({
                email: userToCreate.email,
                password: hashedPw,
                username: userToCreate.username
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', customerId: result._id })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        });
    try {
        const userExistsAlready = await Customer.find({ email: userToCreate.email })
        if (userExistsAlready.length > 0) return res.status(401).json({ msg: 'E-mail already exist' })

        const createNewAccount = await Customer.create(userToCreate)
        return res.status(201).json(creation)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ msg: 'No information available for this page' })
    }
}

exports.login = (req, res) => {

}