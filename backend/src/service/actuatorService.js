const actuatorDAO = require("../dao/actuatorDAO");
const { getMqttClient } = require("../config/mqtt");

class ActuatorService {
    async getActuators() {
        let actuators = await actuatorDAO.findCurrent();

        if (!actuators) {
            actuators = await actuatorDAO.create();
        }

        return actuators;
    }

    async updateActuator(tipo, ativo) {
        const actuators = await this.getActuators();

        actuators[tipo] = ativo;
        actuators.updatedAt = new Date();

        await actuatorDAO.save(actuators);

        const mqttClient = getMqttClient();
        if (mqttClient) {
            mqttClient.publish(
                "ecocomp/estufa-001/actuators",
                JSON.stringify(actuators)
            );
        }

        return actuators;
    }
}

module.exports = new ActuatorService();
