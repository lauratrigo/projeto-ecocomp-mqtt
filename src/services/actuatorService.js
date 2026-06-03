const Actuator = require("../models/Actuator");
const { getMqttClient } = require("../config/mqtt");

async function getActuators() {
    let actuators = await Actuator.findOne();

    if (!actuators) {
        actuators = new Actuator();
        await actuators.save();
    }

    return actuators;
}

async function updateActuator(tipo, ativo) {
    const actuators = await getActuators();

    actuators[tipo] = ativo;
    actuators.updatedAt = new Date();

    await actuators.save();

    const mqttClient = getMqttClient();
    if (mqttClient) {
        mqttClient.publish(
            "ecocomp/estufa-001/actuators",
            JSON.stringify(actuators)
        );
    }

    return actuators;
}

module.exports = {
    getActuators,
    updateActuator
};
