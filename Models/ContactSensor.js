const { ObjectId } = require('mongoose');
const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema(
    {
        id: {
            type: String,
            required: false
        },
        Name: {
            type: String,
            required: true
        },
        enabled: {
            type: Number,
            default: true
        },
        UUID: {
            type: String,
            required: true
        },
        MqttLogin: {
            type: String,
            required: true
        },
        Mqttpass: {
            type: String,
            required: true
        },
        Active: {
            type: Boolean,
            default: true,
            required: true
        },
        GPS: [Object]
        ,
        Automation: [Object]
        ,
        Created_date: {
            type: Date,
            default: Date.now()
        },
        Property: {
            type: String,
            required: false
        },
        Room: {
            type: String,
            required: false
        }
        ,
        State: [Object]
    }
);

module.exports = mongoose.model('ContactSensor', ContactSchema);
