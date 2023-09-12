const { ObjectId } = require('mongoose');
const mongoose=require('mongoose');

const HubSchema = mongoose.Schema(
    {
        id: {
            type : String,
            required : false
        },
        Name: {
            type : String,
            required : true
        },
        Owner: [Object]
        ,
        Devices: [Object]
        ,
        House: [String]
        ,
        enabled: {
            type : Number,
            default:true
        },
        MqttLogin: {
            type : String,
            required : true
        },
        Mqttpass: {
            type : String,
            required : true
        },
        UUID: {
            type : String,
            required : true
        },
        Active: {
            type : Boolean,
            default:true,
            required : true
        },
        GPS: [Object]
        ,
        Automation: [Object]
        ,
        Created_date: {
            type : Date,
            default : Date.now()
        }
    }
);

module.exports=mongoose.model('Hub',HubSchema);