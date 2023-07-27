const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
const House  = require('../Models/House');
const Room  = require('../Models/Room');
var jwt = require('jsonwebtoken');
const LightSwitch = require('../Models/LightSwitch.js');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');


async function verifyPOSTToken(req, res, next) {
    let payload;
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    
    if(bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    console.log(req.token);
    try{ payload = jwt.verify(req.token, process.env.token_Key);} 
    catch (e) {
        return res.status(403).send('Unauthorized request')
    }
    if(!payload) {
        return res.status(403).send('Unauthorized request')
    }
    decoded=jwt.decode(req.token, {complete: true});
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user =await User.find({ email : req.body.email }).limit(1);
    if (user === undefined || user.length == 0 ) {
        return res.status(401).send('Unauthorized request');
    }
    if ( user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    }else {
        return res.status(401).send('Unauthorized request');
    }
}
async function verifyGETToken(req, res, next) {
    let payload;
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if(bearerHeader === 'null') {
        return res.status(403).send('Unauthorized request')
    }
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
    } else {
        return res.status(403);
    }
    try{ payload = jwt.verify(req.token, process.env.token_Key);} 
    catch (e) {
        return res.status(400).send('Invalid User');
    }
    if(!payload) {
        return res.status(401).send('Unauthorized request');
    }
    decoded=jwt.decode(req.token, {complete: true});
    /*
    {
        email: 'admin@admin.com',
        id: '63f9fd6ec58ecd3304639e83',
        iat: 1677956185
    }*/
    //check decoded is the same as email address and with same id
    const user =await User.find({ email : req.query.email }).limit(1);
    console.log(user)
    console.log()
    console.log()
    if (user === undefined || user.length == 0 ) {
        return res.status(401).send('Unauthorized request');
    }
    if ( user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id && user[0].enabled) {
        req.userId = decoded.payload.id;
        req.user = user[0];
        next()
    }else {
        return res.status(401).send('Unauthorized request');
    }
}


/*****problem */
router.get('/GetRoom',verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Room"]
     */
    if (req.user.enabled && req.user.Houses.includes(req.query.houseId)) {
    let h = await House.find({ "_id" : req.query.houseId });
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({status:"ok" , message: 'House', house : h });
    } else {
    res.status(400).send('Not found');
    }
    return ;
});
/*
{
    "HouseName":"default",
    "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvdXphaS5hbGFhQGdtYWlsLmNvbSIsImlkIjoiNjRiNDRmNDJlMTAzMDU0N2M1YTBjNzBhIiwiaWF0IjoxNjg5NTM4MzcwfQ.TN8UVQ2yjbvjJW4507Sx9hOApHzlA8xa5FiqQy1QSNg",
    "email":"fouzai.alaa@gmail.com"
}*/
router.post('/AddRoom',verifyPOSTToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Room"]
     */
    try{
         if (req.body.houseId === null ) {
            res.json({ message:"select a house" });
            return ;
         }
         //check if user has that house
         if (! req.user.Houses.includes(req.body.houseId) ) {
            res.json({ message:"error with your house" });
            return ;
         }
        let r = new Room({
            Name : req.body.RoomName,
            Owner : [{"admin" :req.user._id.toString()}],
            Devices: []
        });
        r = await r.save();
        //update user
        console.log(r._id.toString())
        h=await House.findOne({ "_id" : req.body.houseId });
        console.log(h)
        h.Rooms.push(r._id.toString());
        h = await h.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'New Room Added',house : h , rooms :r });
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
module.exports = router;