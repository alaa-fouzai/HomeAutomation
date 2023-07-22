const { randomUUID } = require('crypto');
const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
const LightSwitch = require('../Models/LightSwitch.js');
const Mongoose=require('mongoose');
var object = require('lodash/fp/object');
var util = require('../utilities/utilities');
async function verifyPOSTToken(req, res, next) {
    let payload;
    if(req.body.token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    try{ payload = jwt.verify(req.body.token, process.env.token_Key);} 
    catch (e) {
        
        return res.status(400).send('Invalid User');
    }
    if(!payload) {
        return res.status(401).send('Unauthorized request');
    }

    decoded=jwt.decode(req.body.token, {complete: true});
    /*
    {
  email: 'admin@admin.com',
  id: '63f9fd6ec58ecd3304639e83',
  iat: 1677956185
}*/
    //check decoded is the same as email address and with same id
    const user =await User.find({ email : req.body.email }).limit(1);
    console.log(user)
    if (user === undefined || user.length == 0 ) {
        return res.status(401).send('Unauthorized request');
    }
    console.log(user[0].email === decoded.payload.email)
    console.log(user[0]._id.toString() === decoded.payload.id)
    if ( user[0].email === decoded.payload.email && user[0]._id.toString() === decoded.payload.id) {
        req.userId = decoded.payload.id;
        next()
    }else {
        return res.status(401).send('Unauthorized request');
    }
}
function verifyGETToken(req, res, next) {
    let payload;
    if(req.body.token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    try{ payload = jwt.verify(req.query.token, process.env.token_Key);} 
    catch (e) {
        return res.status(400).send('Invalid User');
    }
    if(!payload) {
        return res.status(401).send('Unauthorized request');
    }

    decoded=jwt.decode(req.query.token, {complete: true});
    /*
    {
  email: 'admin@admin.com',
  id: '63f9fd6ec58ecd3304639e83',
  iat: 1677956185
}*/
    req.userId = decoded.payload.id;

    next()
}
router.post('/AddNew',verifyPOSTToken,async (req,res) =>
{
    try{
        //let user = await User.findOne({ _id : req.userId  }).limit(1);
        //console.log(req.userId);
        //check if user is valid
        //console.log("unique UUID ");
        newUUid = randomUUID();
        while(true) {
            let L = await LightSwitch.findOne({ "UUID" : newUUid });
            console.log(L)
            if (!L) {
                console.log("newLightSwitch");
                break;
              } else {
                newUUid = randomUUID();
                console.log(newUUid);
              }
        }
        console.log("unique UUID :",newUUid);
        let newLightSwitch = new LightSwitch({
            Name:req.body.Name,
            UUID: newUUid,
            MqttLogin: RandomString(6),
            //encrypt
            Mqttpass: RandomString(6)

        });
        newLightSwitch = await newLightSwitch.save();
        console.log(newLightSwitch);
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'Switch Added' , LightSwitch:newLightSwitch});
        return ;
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log(err);
        res.json({ message:err.message });
    }

});
router.post('/Authlightswitch',verifyPOSTToken,async (req,res) =>
{
    /*let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {*/
    try{
        let ls = await LightSwitch.findOne({ "UUID" : req.body.UUID });
        //console.log(ls.Active);
        if (!ls) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("null");
            res.status(404).send('Not found');
            return ;
        }
        if (! ls.Active) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.status(404).send('Not Active');
            return ;
        }
        if (ls.MqttLogin === req.body.Login && ls.Mqttpass === req.body.password) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("success");
            res.json({status:"ok" , message: 'success'});
            return ;
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
router.post('/ChangeState',verifyPOSTToken,async (req,res) =>
{
    let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {
    try{
        let c = await Chat.findOne({"_id" : Mongoose.Types.ObjectId(req.body.id) } ).limit(1);
        console.log(c)
        c.state = (c.state === true ) ? c.state = false : c.state = true ;
        console.log(c);
        await c.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"ok" , message: 'State Changed',chat : c });
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