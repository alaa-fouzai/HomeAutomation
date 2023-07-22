const express = require('express');
const router =express.Router();
const User  = require('../Models/User');
var jwt = require('jsonwebtoken');
/**
 * @swagger
 * tags:
 *   name: User
 *   description: The User managing API
 * /api/users/register:
 *   post:
 *     summary: Create a new User
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         message: Account Create ! You can now Login.
 *         token : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvdXphaS5hbGFhQGdtYWlsLmNvbSIsImlkIjoiNjRiNDRmNDJlMTAzMDU0N2M1YTBjNzBhIiwiaWF0IjoxNjg5NTM4MzcwfQ.TN8UVQ2yjbvjJW4507Sx9hOApHzlA8xa5FiqQy1QSNg
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 *
 */

router.post('/register',async (req,res) =>
{/*
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZvdXphaS5hbGFhQGdtYWlsLmNvbSIsImlkIjoiNjRiNDRmNDJlMTAzMDU0N2M1YTBjNzBhIiwiaWF0IjoxNjg5NTM4MzcwfQ.TN8UVQ2yjbvjJW4507Sx9hOApHzlA8xa5FiqQy1QSNg
*/
    let user=new User({
        FirstName : req.body.FirstName,
        LastName :req.body.LastName,
        email :req.body.email,
        password :req.body.password,
        enabled :1,
        picture :"",
        Role :["user"],
    });
    try{
        const NewUser =await User.find({ email : req.body.email });
        if (NewUser === undefined || NewUser.length == 0 )
        {
            //add not allow duplicate
            user = await user.save();
            token = CreateJWT(user.email,user._id);
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.json({status:"ok" , message: 'Account Create ! You can now Login',token : token });
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        console.log("register ",err.message)
        res.json({ message:"error" });
    }

});
router.get('/users',async (req , res)=>{
    try{
        const user=await User.find().limit(5);
        res.header("Access-Control-Allow-Headers", "*");
        res.json(user);
    }catch (e) {
        res.json({ message:err.message });
    }
});
router.post('/user',async (req , res)=>{
    try{
        var decoded = jwt.verify(req.body.token,process.env.token_Key );
        const user=await User.findOne({ _id: decoded.id });;
        res.header("Access-Control-Allow-Headers", "*");
        res.json(user);
    }catch (e) {
        res.json({ message:e.message });
    }
});
router.post('/login',async (req,res) =>
{
    try{
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser =await User.find({ email : req.body.email  }).limit(1);
        //console.log(NewUser.length);
        //await sleep(2000);
        if (NewUser.length < 1)
        {
            await res.json({status: "err", message: 'Email Does not Exists'});
            return ;
        }
        if (NewUser[0].password !== req.body.password )
        {
            await res.json({status:"err" , message: 'Wrong Paswword'});
            return ;
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.json({status:"err" , message: 'User is Disabled'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        }
        let token = CreateJWT(req.body.email,NewUser[0]._id);
        res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token:token});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }

});
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
router.post('/loginGmail',async (req,res) =>
{

    if (!req.body.resp.email)
    {
        res.json({status:"err" , message: 'email error'});
        console.log(req.body.resp.email);
        return ;
    }
    try{
        // await new Promise(resolve => setTimeout(resolve, 5000));
        const NewUser =await User.find({ email : req.body.resp.email  }).limit(1);
        console.log(NewUser.length);
        if (NewUser.length < 1)
        {
            await res.json({status: "err", message: 'Email Does not Exists'});
            return ;
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.json({status:"err" , message: 'User is Disabled'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload,process.env.token_Key);
        res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
router.post('/RegisterGmail',async (req,res) => {
    console.log('New Request :',req.body);
    if (!req.body.resp.email)
    {
        res.json({status:"err" , message: 'email error'});
        console.log(req.body.resp.email);
        return ;
    }
    const NewUser =await User.find({ email : req.body.resp.email  }).limit(1);
    console.log(NewUser.length);
    if (NewUser.length > 0)
    {
        await res.json({status: "err", message: 'Email Exists'});
        return ;
    }
    let user=new User({
        FirstName : req.body.resp.firstName,
        LastName :req.body.resp.lastName,
        email :req.body.resp.email,
        password : '123123',
        enabled : true,
    });
    try{
        const NewUser =await User.find({ email : req.body.resp.email });
        if (NewUser === undefined || NewUser.length === 0 )
        {
            user=await user.save();
            res.json({status:"ok" , message: 'Account Create ! You can now Login'});
            return ;
        }

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }
});
function CreateJWT(email,id) {
    let token = jwt.sign({email:email,id:id},process.env.token_Key);
    return token;
}

module.exports = router;
