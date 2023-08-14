const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
const LightSwitch = require('../Models/LightSwitch.js');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');
var util = require('../utilities/utilities');
const Room = require('../Models/Room');
const House = require('../Models/House');

router.post('/AddNew',util.verifyPOSTToken,async (req,res) =>
{
    /*
     * #swagger.tags = ["LightSwitch"]
     */
    try{
        //let user = await User.findOne({ _id : req.userId  }).limit(1);
        //console.log(req.userId);
        //check if user is valid
        //console.log("unique UUID ");
        newUUid = randomUUID();
        while(true) {
            let L = await LightSwitch.findOne({ "UUID" : newUUid });
            if (!L) {
                console.log("newLightSwitch");
                break;
              } else {
                newUUid = randomUUID();
                console.log(newUUid);
              }
        }
        let newLightSwitch = new LightSwitch({
            Name:req.body.Name,
            UUID: newUUid,
            MqttLogin: newUUid,
            //encrypt
            Mqttpass: RandomString(6)+"!:!"+RandomString(6)

        });
        newLightSwitch = await newLightSwitch.save();
        // add light to user,and room 
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
        r=await r.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'Switch Added' , LightSwitch:newLightSwitch,house:h,room:r});
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log(err);
        res.status(400).send('Bad request');
    }
});
router.post('/Authlightswitch',async (req,res) =>
{
    /*
     * #swagger.tags = ["LightSwitch"]
     */
    /*let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {*/
    try{
        let ls = await LightSwitch.findOne({ "UUID" : req.body.client.substring(7) });
        //console.log(ls.Active);
        if (!ls) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("null");
            res.status(400).send('Not found');
            return ;
        }
        if (! ls.Active) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("Not Active");
            res.status(400).send('Not Active');
            return ;
        }
        if (ls.MqttLogin === req.body.login && ls.Mqttpass === req.body.password) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("success");
            res.json({status:"ok" , message: 'success'});
            return ;
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        console.log('Not found');
        res.status(400).send('Not found');
        return ;
        
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
/*} else {
    res.json({ status:"err",message:"problem" });
}*/
});
router.post('/ChangeState',util.verifyPOSTToken,async (req,res) =>
{
    /*
     * #swagger.tags = ["LightSwitch"]
     */
    let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {
    try{
        let c = await LightSwitch.findOne({"_id" : Mongoose.Types.ObjectId(req.body.id) } ).limit(1);
        console.log(c)
        c.state = (c.state === true ) ? c.state = false : c.state = true ;
        console.log(c);
        await c.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'State Changed',LightSwitch : c });
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
} else {
    res.json({ status:"err",message:"problem" });
}
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