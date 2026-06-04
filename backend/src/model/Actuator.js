const mongoose = require("mongoose");

class Actuator {
    constructor(data) {
        Object.assign(this, data);
    }
}

const ActuatorSchema = new mongoose.Schema({
    bomba: { type: Boolean, default: false },
    ventoinha: { type: Boolean, default: false },
    lampada: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Actuator", ActuatorSchema);
