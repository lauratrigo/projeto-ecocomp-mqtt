const mongoose = require("mongoose");

const ReadingSchema = new mongoose.Schema({
    deviceId: String,
    soil: Number,
    airHumidity: Number,
    airTemp: Number,
    soilExternal: Number,
    airHumidityExternal: Number,
    tempExternal: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reading", ReadingSchema);
