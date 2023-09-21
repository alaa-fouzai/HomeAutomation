const { randomUUID } = require('crypto');
const express = require('express');
const router = express.Router();
const User = require('../Models/User');
var jwt = require('jsonwebtoken');
const ContactSensor = require('../Models/ContactSensor');
const Mongoose = require('mongoose');
var object = require('lodash/fp/object');
var util = require('../utilities/utilities');
const Room = require('../Models/Room');
const House = require('../Models/House');

router.post('/AddToUser', util.verifyPOSTToken, async (req, res) => {
    /*
     * #swagger.tags = ["ContactSensor"]
     */
    try {
        let cs = await ContactSensor.findOne({
            UUID: req.body.ContactUUID,
        });
        // add light to user,and room 
        let h;
        let r;
        if (req.user.enabled && req.user.Houses.includes(req.body.houseId)) {
            h = await House.findOne({ "_id": req.body.houseId });
            h.Devices.push({ "type": "ContactSensor", "id": cs._id.toString() });

        } else {
            x = await ContactSensor.deleteOne({ _id: cs._id });
            res.status(401).send('not your house');
            return;
        }
        //check room
        if (req.user.enabled && h.Rooms.includes(req.body.roomId)) {
            r = await Room.findOne({ "_id": req.body.roomId });
            r.Devices.push({ "type": "ContactSensor", "id": cs._id.toString() });
        } else {
            r = await ContactSensor.deleteOne({ _id: cs._id });
            res.status(401).send('not your room');
            return;
        }
        h = await h.save();
        r = await r.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({ status: "ok", message: 'Switch Added', ContactSensor: cs, house: h, room: r });
        return;
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log(err);
        res.status(400).send('Bad request');
    }
});
router.post('/AddContactSensorToDatabase', util.verifyPOSTToken, async (req, res) => {
    /*
     * #swagger.tags = ["ContactSensor"]
     */
    try {
        //let user = await User.findOne({ _id : req.userId  }).limit(1);
        //console.log(req.userId);
        //check if user is valid
        //console.log("unique UUID ");
        newUUid = randomUUID();
        while (true) {
            let L = await ContactSensor.findOne({ "UUID": newUUid });
            if (!L) {
                console.log("newSwitch");
                break;
            } else {
                newUUid = randomUUID();
                console.log(newUUid);
            }
        }
        let newContact = new ContactSensor({
            Name: req.body.Name,
            Active: false,
            UUID: newUUid,
        });
        newContact = await newContact.save();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({ status: "ok", message: 'Contact Sensor Added', ContactSensor: newContact });
        return;
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log(err);
        res.status(400).send('Bad request');
    }
});
router.post('/ChangeState', util.verifyPOSTToken, async (req, res) => {
    /*
     * #swagger.tags = ["ContactSensor"]
     */
    let user = await User.findOne({ _id: req.userId }).limit(1);
    if (user.enabled == 1) {
        try {
            let c = await Switch.findOne({ "_id": Mongoose.Types.ObjectId(req.body.id) }).limit(1);
            console.log(c)
            c.state = (c.state === true) ? c.state = false : c.state = true;
            console.log(c);
            await c.save();
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json({ status: "ok", message: 'State Changed', Switch: c });
            return;
        } catch (err) {
            res.header("Access-Control-Allow-Headers", "*");
            res.json({ message: err.message });
        }
    } else {
        res.json({ status: "err", message: "problem" });
    }
});

router.post('/newData', async (req, res) => {
    /*
     * #swagger.tags = ["ContactSensor"]
     */
    try {
        /*let c = await Switch.findOne({"_id" : Mongoose.Types.ObjectId(req.body.id) } ).limit(1);
        console.log(c)
        c.state = (c.state === true ) ? c.state = false : c.state = true ;
        console.log(c);
        await c.save();*/
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({ status: "ok", message: 'success' });
        return;
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message: err.message });
    }

});
module.exports = router;