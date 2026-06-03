const deviceService = require("../services/deviceService");

async function testDevice(req, res) {
    const device = await deviceService.findTestDevice();
    res.json(device);
}

module.exports = {
    testDevice
};
