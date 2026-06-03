const mongoose = require("mongoose");

const ActuatorSchema = new mongoose.Schema({
    bomba: { type: Boolean, default: false },
    ventoinha: { type: Boolean, default: false },
    lampada: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Actuator", ActuatorSchema);
