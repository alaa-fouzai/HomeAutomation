const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
const LightSwitch = require('../Models/LightSwitch.js');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');




module.exports = router;