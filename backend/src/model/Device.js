const mongoose = require("mongoose");

class Device {
    constructor(data) {
        Object.assign(this, data);
    }
}

const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    name: String,
    location: String,
    active: Boolean
});

module.exports = mongoose.model("Device", DeviceSchema, "devices");
