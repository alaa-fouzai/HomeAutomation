const { ObjectId } = require('mongoose');
const mongoose=require('mongoose');

const RoomSchema = mongoose.Schema(
    {
        id: {
            type : String,
            required : false
        },
        Name: {
            type : String,
            required : true
        },
        enabled: {
            type : Number,
            default:true
        },
        Owner: [Object]
        ,
        Devices: [Object]
    }
);

module.exports=mongoose.model('Room',RoomSchema);