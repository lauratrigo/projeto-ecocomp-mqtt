const mongoose = require("mongoose");

const ConfigSchema = new mongoose.Schema({
    soloMin: Number,
    tempMax: Number,
    tempMin: Number
});

module.exports = mongoose.model("Config", ConfigSchema);
