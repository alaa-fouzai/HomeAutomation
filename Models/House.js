const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const HouseSchema = mongoose.Schema(
    {
        id: {
            type: String,
            required: false
        },
        Name: {
            type: String,
            required: true
        },
        Owner: [Object]
        ,
        Devices: [Object]
        ,
        Rooms: []
        ,
        enabled: {
            type: Number,
            default: true
        },
    }
);

module.exports = mongoose.model('House', HouseSchema);