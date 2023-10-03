const { randomUUID } = require('crypto');
const express = require('express');
const router = express.Router();
const User = require('../Models/User');
var jwt = require('jsonwebtoken');
const LightSwitch = require('../Models/Switch.js');
const Mongoose = require('mongoose');
var object = require('lodash/fp/object');

async function verifyPOSTToken(req, res, next) {
    let payload;
    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    try { payload = jwt.verify(req.token, process.env.token_Key); }
    catch (e) {
        return res.status(403).send('Unauthorized request')
    }
    if (!payload) {
        return res.status(403).send('Unauthorized request')
    }
    decoded = jwt.decode(req.token, { complete: true });
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user = await User.find({ email: req.body.email }).limit(1);
    if (user === undefined || user.length == 0) {
        return res.status(401).send('Unauthorized request');
    }
    if (user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    } else {
        return res.status(401).send('Unauthorized request');
    }
}
async function verifyGETToken(req, res, next) {
    let payload;
    var bearerToken;

    var bearerHeader = req.headers["authorization"];
    if (bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    try {
        payload = jwt.verify(req.token, process.env.token_Key);

    }
    catch (e) {
        console.log('Invalid User')
        return res.status(404).send('Invalid User');
    }
    if (!payload) {
        return res.status(401).send('Unauthorized request');
    }

    decoded = jwt.decode(req.token, { complete: true });
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user = await User.find({ email: decoded.payload.email }).limit(1);

    if (user === undefined || user.length == 0) {
        return res.status(401).send('Unauthorized request');
    }
    if (user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    } else {
        return res.status(401).send('Unauthorized request');
    }
}
async function verifyPutToken(req, res, next) {
    let payload;
    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    try { payload = jwt.verify(req.token, process.env.token_Key); }
    catch (e) {
        return res.status(403).send('Unauthorized request')
    }
    if (!payload) {
        return res.status(403).send('Unauthorized request')
    }
    decoded = jwt.decode(req.token, { complete: true });
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user = await User.find({ email: payload.email }).limit(1);
    if (user === undefined || user.length == 0) {
        return res.status(401).send('Unauthorized request');
    }
    if (user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    } else {
        return res.status(401).send('Unauthorized request');
    }
}
async function verifyDeleteToken(req, res, next) {
    let payload;
    var bearerToken;
    var bearerHeader = req.headers["authorization"];

    if (bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    try { payload = jwt.verify(req.token, process.env.token_Key); }
    catch (e) {
        return res.status(403).send('Unauthorized request')
    }
    if (!payload) {
        return res.status(403).send('Unauthorized request')
    }
    decoded = jwt.decode(req.token, { complete: true });
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user = await User.find({ email: payload.email }).limit(1);
    if (user === undefined || user.length == 0) {
        return res.status(401).send('Unauthorized request');
    }
    if (user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    } else {
        return res.status(401).send('Unauthorized request');
    }
}

function RandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
module.exports = { verifyGETToken, verifyPOSTToken, verifyDeleteToken, verifyPutToken, RandomString };