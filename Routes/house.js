const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
const House = require('../Models/House.js');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');
var util = require('../utilities/utilities');


router.get('/Gethouse',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["House"]
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
router.post('/Addhouse',util.verifyPOSTToken,async(req,res)=>{
    /*
     * #swagger.tags = ["House"]
     */
    try{
        let p = new House({
            Name : req.body.HouseName,
            Owner: [{"admin" :req.user._id.toString()}]
        });
        p = await p.save();
        //update user
        console.log(p._id.toString())
        u=await User.findOne({ "email" : req.user.email });
        console.log(u)
        u.Houses.push(p._id.toString());
        u = await u.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'House Created',property : p });
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
router.get('/GetAllHouses',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["House"]
     */
    try {
    const records = await House.find().where('_id').in(req.user.Houses).exec();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({status:"ok" , message: 'Houses found', Houses : records });
    } 
    catch(e) {
    console.log(e);
    res.status(404).send('Not found');
    }
    return ;
});
router.get('/GetUserHouses',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["House"]
     */
    try {
    //const records = await House.find().where('_id').in(req.user.Houses).exec();
    const records = await House.find({
        Owner: {$elemMatch: {admin: req.userId}}
     })
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({status:"ok" , message: 'Houses found', Houses : records });
    } 
    catch(e) {
    console.log(e);
    res.status(404).send('Not found');
    }
    return ;
});
module.exports = router;