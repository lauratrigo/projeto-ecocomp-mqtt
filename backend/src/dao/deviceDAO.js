const Device = require("../model/Device");

class DeviceDAO {
    async findByDeviceId(deviceId) {
        return Device.findOne({ deviceId });
    }
}

module.exports = new DeviceDAO();
