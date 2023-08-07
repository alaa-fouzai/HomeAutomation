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
var util = require('../utilities/utilities');


/*****problem */
router.get('/GetRoom',util.verifyGETToken,async(req,res)=>{
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
router.post('/AddRoom',util.verifyPOSTToken,async(req,res)=>{
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