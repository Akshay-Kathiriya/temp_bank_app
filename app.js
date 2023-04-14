const express = require("express");
const bodyParser = require('body-parser');
//const path = require('path');
const adminRoutes = require('./routes/admin');
const customerRoutes = require('./routes/customer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT
const mongodbURI = process.env.MONGODB_URI
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

//Change below routes:
app.use('/bank/customer', customerRoutes);
app.use('/bank/admin', adminRoutes);
// app.use('/bank/transaction', );
// app.use('/auth',authRoutes)


app.use((error, req, res, next) => { //error handling middleware
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(mongodbURI)
    .then(() => {
        app.listen(port);
        console.log('connected');
    })
    .catch(err => {
        console.log(err);
    });