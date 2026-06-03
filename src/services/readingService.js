const Reading = require("../models/Reading");

async function createReading(payload) {
    const {
        deviceId,
        soil,
        airHumidity,
        airTemp,
        soilExternal,
        airHumidityExternal,
        tempExternal
    } = payload;

    const data = new Reading({
        deviceId,
        soil: soil ?? 0,
        airHumidity: airHumidity ?? 0,
        airTemp: airTemp ?? 0,
        soilExternal: soilExternal ?? 0,
        airHumidityExternal: airHumidityExternal ?? 0,
        tempExternal: tempExternal ?? 0
    });

    await data.save();
    return data;
}

async function getReadingsByDevice(deviceId, limit = 500) {
    const data = await Reading.find({ deviceId })
        .sort({ createdAt: -1 })
        .limit(limit);

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

module.exports = {
    createReading,
    getReadingsByDevice
};
