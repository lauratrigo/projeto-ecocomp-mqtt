const Reading = require("../model/Reading");

class ReadingDAO {
    async create(data) {
        return new Reading(data).save();
    }

    async findByDeviceId(deviceId, limit) {
        return Reading.find({ deviceId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

module.exports = new ReadingDAO();
