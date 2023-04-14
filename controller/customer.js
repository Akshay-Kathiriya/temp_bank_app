const { validationResult } = require('express-validator')
const Customer = require('../models/customer.js');
const bcrypt = require('bcryptjs');