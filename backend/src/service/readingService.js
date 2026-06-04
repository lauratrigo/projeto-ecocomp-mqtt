const readingDAO = require("../dao/readingDAO");

class ReadingService {
    async createReading(payload) {
        const {
            deviceId,
            soil,
            airHumidity,
            airTemp,
            soilExternal,
            airHumidityExternal,
            tempExternal
        } = payload;

        return readingDAO.create({
            deviceId,
            soil: soil ?? 0,
            airHumidity: airHumidity ?? 0,
            airTemp: airTemp ?? 0,
            soilExternal: soilExternal ?? 0,
            airHumidityExternal: airHumidityExternal ?? 0,
            tempExternal: tempExternal ?? 0
        });
    }

    async getReadingsByDevice(deviceId, limit = 500) {
        const data = await readingDAO.findByDeviceId(deviceId, limit);

        return data.map((item) => ({
            createdAt: item.createdAt,
            soil: item.soil ?? 0,
            airHumidity: item.airHumidity ?? 0,
            airTemp: item.airTemp ?? 0,
            soilExternal: item.soilExternal ?? 0,
            airHumidityExternal: item.airHumidityExternal ?? 0,
            tempExternal: item.tempExternal ?? 0
        }));
    }
}

module.exports = new ReadingService();
