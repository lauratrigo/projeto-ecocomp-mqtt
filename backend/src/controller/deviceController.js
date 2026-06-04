const deviceService = require("../service/deviceService");

class DeviceController {
    async testDevice(req, res) {
        const device = await deviceService.findTestDevice();
        res.json(device);
    }
}

module.exports = new DeviceController();
