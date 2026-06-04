const deviceDAO = require("../dao/deviceDAO");

class DeviceService {
    async findTestDevice() {
        return deviceDAO.findByDeviceId("estufa-001");
    }
}

module.exports = new DeviceService();
