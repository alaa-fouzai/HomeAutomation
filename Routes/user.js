const express = require('express');
const router = express.Router();
const User = require('../Models/User');
var jwt = require('jsonwebtoken');
var util = require('../utilities/utilities');
const House = require('../Models/House.js');
const Room = require('../Models/Room.js');
const Switch = require('../Models/Switch.js');
const Mongoose = require('mongoose');
const object = require('lodash/object');
const { randomUUID } = require('crypto');
router.post('/register', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    let user = new User({
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        email: req.body.email,
        password: req.body.password,
        enabled: 1,
        picture: "",
        Role: ["user"],
    });
    try {
        const NewUser = await User.find({ email: req.body.email });
        if (NewUser === undefined || NewUser.length == 0) {
            newUUid = randomUUID();
            while (true) {
                let L = await User.findOne({ "UUID": newUUid });
                if (!L) {
                    console.log("User");
                    break;
                } else {
                    newUUid = randomUUID();
                    console.log(newUUid);
                }
            }
            user.MqttId = newUUid;
            user.MqttLogin = RandomString(6);
            user.Mqttpass = RandomString(6);
            //add not allow duplicate
            user = await user.save();
            token = CreateJWT(user.email, user._id);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json({ status: "ok", message: 'Account Create ! You can now Login', token: token, user: user });
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //res.json({status:"err" , message: 'Email Already Exists'});
        res.status(401).send('Email Already Exists');
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log("register ", err.message)
        res.status(400).send('Bad request');
    }

});
router.get('/users', async (req, res) => {

    /*
     * #swagger.tags = ["User"]
     */
    try {
        const user = await User.find().limit(5);
        res.header("Access-Control-Allow-Headers", "*");
        res.json(user);
    } catch (e) {
        res.json({ message: err.message });
    }
});
router.get('/userInfo', util.verifyGETToken, async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    try {
        const user = await User.findOne({ "email": req.user.email });
        /*const Hubs = await Hub.find({
            Owner: { $elemMatch: req.userId }
        })
        const LightSwitches = await Switch.findOne({ "UUID" : req.body.client });
        const Houses = await House.find().where('_id').in(req.user.Houses).exec();
        const Rooms = await Room.find({ "_id" : req.query.houseId });
        const Switch = await Switch.findOne({"_id" : Mongoose.Types.ObjectId(req.body.id) } ).limit(1);
        */
        resp = { ...user }
        for (i = 0; i < user.Houses.length; i++) {
            Houses = await House.findOne().where('_id').in(req.user.Houses).exec();
            for (j = 0; j < Houses.Rooms.length; j++) {
                Rooms = await Room.findOne({ "_id": Houses.Rooms[j] });
                for (k = 0; k < Rooms.Devices.length; k++) {
                    if (Rooms.Devices[k].type === "switch") {
                        sw = await Switch.where('_id').in(Rooms.Devices[k].id).exec();
                        Rooms.Devices[k] = sw
                    }

                }
                Houses.Rooms[j] = Rooms
            }
            user.Houses[i] = Houses
            resp = { ...user }
        }
        res.header("Access-Control-Allow-Headers", "*");
        res.json(resp._doc);
    } catch (e) {
        res.json({ message: e.message });
    }
});
router.post('/user', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    try {
        var decoded = jwt.verify(req.body.token, process.env.token_Key);
        const user = await User.findOne({ _id: decoded.id });
        res.header("Access-Control-Allow-Headers", "*");
        res.json(user);
    } catch (e) {
        res.json({ message: e.message });
    }
});
router.post('/login', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    try {
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser = await User.find({ email: req.body.email }).limit(1);
        //console.log(NewUser.length);
        //await sleep(2000);
        if (NewUser.length < 1) {
            await res.status(400).send({ status: "err", message: 'Email Does not Exists' });
            return;
        }
        if (NewUser[0].password !== req.body.password) {
            await res.status(400).send({ status: "err", message: 'Wrong Paswword' });
            return;
        }
        if (NewUser[0].enabled === 0) {
            await res.status(400).send({ status: "err", message: 'User is Disabled' });
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        }
        let token = CreateJWT(req.body.email, NewUser[0]._id);
        res.json({ status: "ok", message: 'Welcome Back', UserData: NewUser, token: token });
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message: err.message });
    }

});
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
router.post('/loginGmail', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    if (!req.body.resp.email) {
        res.json({ status: "err", message: 'email error' });
        console.log(req.body.resp.email);
        return;
    }
    try {
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser = await User.find({ email: req.body.resp.email }).limit(1);
        console.log(NewUser.length);
        if (NewUser.length < 1) {
            await res.json({ status: "err", message: 'Email Does not Exists' });
            return;
        }
        if (NewUser[0].enabled === 0) {
            await res.json({ status: "err", message: 'User is Disabled' });
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload, process.env.token_Key);
        res.json({ status: "ok", message: 'Welcome Back', UserData: NewUser, token });
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message: err.message });
    }
});
router.post('/RegisterGmail', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    console.log('New Request :', req.body);
    if (!req.body.resp.email) {
        res.json({ status: "err", message: 'email error' });
        console.log(req.body.resp.email);
        return;
    }
    const NewUser = await User.find({ email: req.body.resp.email }).limit(1);
    console.log(NewUser.length);
    if (NewUser.length > 0) {
        await res.json({ status: "err", message: 'Email Exists' });
        return;
    }
    let user = new User({
        FirstName: req.body.resp.firstName,
        LastName: req.body.resp.lastName,
        email: req.body.resp.email,
        password: '123123',
        enabled: true,
    });
    try {
        const NewUser = await User.find({ email: req.body.resp.email });
        if (NewUser === undefined || NewUser.length === 0) {
            user = await user.save();
            res.json({ status: "ok", message: 'Account Create ! You can now Login' });
            return;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({ status: "err", message: 'Email Already Exists' });
    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message: err.message });
    }
});
router.put("/updateUser/:id", async function (req, res) {
    /*
     * #swagger.tags = ["User"]
     */
    var id = req.params.id;
    const user = await User.findById({ _id: id });
    console.log(id);
    console.log(user);
    if (user) {
        Object.assign(user, {
            FirstName: req.body.FirstName ? req.body.FirstName : user.FirstName,
            LastName: req.body.LastName ? req.body.LastName : user.LastName,
            email: req.body.email ? req.body.email : user.email
        })
        user
            .save()
            .then((saved) => {
                res.send(saved)
            })
            .catch((error) => res.status(500).send({ ...error }))
    } else {
        res.status(404).send({ error: 'user error' })
    }
});

router.delete('/:id', async (req, res) => {
    /*
     * #swagger.tags = ["User"]
     */
    try {
        var id = req.params.id;
        const user = await User.findById({ _id: id });
        console.log(id);
        console.log(user);
        if (user) {
            user.enabled = false;
            user
                .save()
                .then((saved) => {
                    res.send(saved)
                })
                .catch((error) => res.status(500).send({ ...error }))
        } else {
            res.status(404).send({ error: 'user error' })
        }

    } catch (error) {
        res.status(400).send({ error: error.message })
    }
})
router.post('/AuthUser', async (req, res) => {
    /*
     * #swagger.tags = ["Switch"]
     */
    /*let user = await User.findOne({ _id : req.userId  }).limit(1);
    if (user.enabled == 1) {*/
    try {
        let ls = await User.findOne({ MqttId: req.body.client });
        //console.log(ls);
        if (!ls) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("null");
            res.status(404).send('Not found');
            return;
        }
        if (!ls.enabled) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            console.log("Not enabled");
            res.status(404).send('Not enabled');
            return;
        }
        if (ls.MqttLogin === req.body.login && ls.Mqttpass === req.body.password) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json({ status: "ok", message: 'success' });
            return;
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        console.log('Not found');
        res.status(404).send('Not found');
        return;

    } catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message: err.message });
    }
    /*} else {
        res.json({ status:"err",message:"problem" });
    }*/
});
function CreateJWT(email, id) {
    let token = jwt.sign({ email: email, id: id }, process.env.token_Key);
    return token;
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
module.exports = router;
