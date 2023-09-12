const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
const Hub = require('../Models/Hub');
const House = require('../Models/House');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');
var util = require('../utilities/utilities');


router.get('/Gethub',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Hub"]
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
router.post('/AddHubToUser',util.verifyPOSTToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Hub"]
     */
    try{


        /**        // add light to user,and room 
        let h;
        let r;
        if (req.user.enabled && req.user.Houses.includes(req.body.houseId)) {
            h = await House.findOne({ "_id" : req.body.houseId });
            h.Devices.push({"type":"LightSwitch" , "id":newLightSwitch._id });
        
        } else {
            x = await LightSwitch.deleteOne({ _id: newLightSwitch._id });
            res.status(401).send('not your house');
            return ;
        }
        //check room
        if (req.user.enabled && h.Rooms.includes(req.body.roomId)) {
            r = await Room.findOne({ "_id" : req.body.roomId });
            r.Devices.push({"type":"LightSwitch" , "id":newLightSwitch._id });
        } else {
            r = await LightSwitch.deleteOne({ _id: newLightSwitch._id });
            res.status(401).send('not your room');
            return ;
        }
        h=await h.save();
        r=await r.save(); */


        let hub = new Hub({
            Name : req.body.HubName,
            Owner: [{"admin" :req.user._id.toString()}]
        });
        hub.House.push(req.body.houseId);
        hub = await hub.save();
        //update user
        console.log(p._id.toString())
        u=await User.findOne({ "email" : req.user.email });
        console.log(u)
        u.Hubs.push(u._id.toString());
        u = await u.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'hub added sucessfully',hub : hub });
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
router.post('/AddHubToDatabase',util.verifyPOSTToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Hub"]
     */
    try{
        //let user = await User.findOne({ _id : req.userId  }).limit(1);
        //console.log(req.userId);
        //check if user is valid
        //console.log("unique UUID ");
        newUUid = randomUUID();
        while(true) {
            let L = await Hub.findOne({ "UUID" : newUUid });
            if (!L) {
                console.log("newLightSwitch");
                break;
              } else {
                newUUid = randomUUID();
                console.log(newUUid);
              }
        }
        let newHub = new Hub({
            Name:req.body.Name,
            UUID: newUUid,
            MqttLogin: RandomString(6),
            Mqttpass: RandomString(6),
            Active:false
        });
        newHub = await newHub.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'hub added sucessfully',hub : newHub});
        return ;

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'hub added sucessfully',hub : hub });
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
router.get('/GetAllhubs',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Hub"]
     */
    try {
    const records = await Hub.find().where('Owner').in(req.user._id.toString()).exec();
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({status:"ok" , message: 'Houses found', hubs : records });
    } 
    catch(e) {
    console.log(e);
    res.status(404).send('Not found');
    }
    return ;
});
router.get('/GetUserHubs',util.verifyGETToken,async(req,res)=>{
    /*
     * #swagger.tags = ["Hub"]
     */
    try {
    //const records = await House.find().where('_id').in(req.user.Houses).exec();
    const records = await Hub.find({
        Owner: {$elemMatch:  req.userId}
     })
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.json({status:"ok" , message: 'hubs found', hubs : records });
    } 
    catch(e) {
    console.log(e);
    res.status(404).send('Not found');
    }
    return ;
});
router.post('/Authhub',async (req,res) =>
{
    /*
     * #swagger.tags = ["Hub"]
     */
    /*let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {*/
    try{
        let ls = await Hub.findOne({ "UUID" : req.body.client });
        //console.log(ls.Active);
        if (!ls) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("null");
            res.status(404).send('Not found');
            return ;
        }
        if (! ls.enabled) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("Not enabled");
            res.status(404).send('Not Enabled');
            return ;
        }
        if (ls.MqttLogin === req.body.login && ls.Mqttpass === req.body.password) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json({status:"ok" , message: 'success'});
            return ;
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        console.log('Not found');
        res.status(404).send('Not found');
        return ;
        
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
/*} else {
    res.json({ status:"err",message:"problem" });
}*/
});
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
module.exports = router;