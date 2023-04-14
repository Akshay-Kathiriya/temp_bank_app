const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')

exports.signup = async (req, res, next) => {

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     const error = new Error('Validation failed');
    //     error.statusCode = 422,
    //         error.data = errors.array();
    //     throw error;
    // }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const maxLoanAmount = 1000000;
    try {
        const hashedPW = await bcrypt
            .hash(password, 12)

        const admin = new Admin({
            email: email,
            password: hashedPW,
            name: name,
            maxLoanAmount: maxLoanAmount
        });
        const result = await admin.save();

        res.status(201).json({
            message: "Admin created Sucessfully!",
            //  userId: result._id
        });
    } catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        next(err); //now eeror will go to next error handling middleware
    };
}


exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadUser;
    try {
        const user = await Admin.findOne({ email: email })

        if (!user) {
            const error = new Error('A User with email could not be found');
            error.statuCode = 401;
            throw error;
        }
        loadedUser = user;

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error('Wrong password');
            error.statusCode = 401;
            throw error;
        }
        //this will create an new signature and packs into a new jwt
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'somesupersecretsecret',
            { expiresIn: '1h' }
        );
        res.status(200)
            .json({
                token: token,
                userId: loadedUser._id.toString()
            })
    }
    catch (err) {
        if (!err.statuCode) {
            err.statuCode = 500;
        }
        console.log(err)
        next(err);//now eeror will go to next error handling middleware

    }

}