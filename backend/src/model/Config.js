const mongoose = require("mongoose");

class Config {
    constructor(data) {
        Object.assign(this, data);
    }
}

const ConfigSchema = new mongoose.Schema({
    soloMin: Number,
    tempMax: Number,
    tempMin: Number
});

module.exports = mongoose.model("Config", ConfigSchema);
