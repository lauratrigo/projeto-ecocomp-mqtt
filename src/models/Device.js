const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    name: String,
    location: String,
    active: Boolean
});

module.exports = mongoose.model("Device", DeviceSchema, "devices");
