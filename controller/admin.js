const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin')
const Customer = require('../models/customer')
const jwt = require('jsonwebtoken')
const path = require('path');
require('dotenv').config();