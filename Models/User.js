const mongoose=require('mongoose');
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - FirstName
 *         - LastName
 *         - email
 *         - password
 *         - enabled
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the User
 *         FirstName:
 *           type: string
 *           description: FirstName of your User
 *         LastName:
 *           type: string
 *           description: LastName of your User
 *         email:
 *           type: string
 *           description: email of your User
 *         password:
 *           type: string
 *           description: password of your User
 *         picture:
 *           type: string
 *           description: picture of your User
 *         enabled:
 *           type: boolean
 *           description: user enabled or not
 *         Created_date:
 *           type: Date
 *           format: date
 *           description: generated by db
 *         Role:
 *           type: array
 *           items:
 *               type: string
 *           description: role of the user
 *         Houses:
 *           type: array
 *           items:
 *               type: string
 *           description: id of houses object in string format
 *       example:
 *         FirstName: alaa
 *         LastName: fouzai
 *         email: fouzai1.alaa@gmail.com
 *         password: aa123123
 */
const UserSchema = mongoose.Schema(
    {
        id: {
            type : String,
            required : false
        },
        FirstName: {
            type : String,
            required : true
        },
        LastName: {
            type : String,
            required : true
        },
        email: {
            type : String,
            required : true
        },
        password: {
            type : String,
            required : true
        },
        picture: {
            type : String,
            required : false
        },
        enabled: {
            type : Number,
            required : true
        },
        Created_date: {
            type : Date,
            default : Date.now()
        },
        Role: [String]
        ,
        Houses: [String]
        ,
    }
);

module.exports=mongoose.model('User',UserSchema);
