const Device = require("../models/Device");

async function findTestDevice() {
    return Device.findOne({ deviceId: "estufa-001" });
}

module.exports = {
    findTestDevice
};
