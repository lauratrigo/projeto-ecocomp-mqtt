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
        this.publishActuators(actuators);

        return actuators;
    }

    async setActuators(newStates) {
        const actuators = await this.getActuators();
        let changed = false;

        Object.keys(newStates).forEach((key) => {
            if (actuators[key] !== undefined && actuators[key] !== newStates[key]) {
                actuators[key] = newStates[key];
                changed = true;
            }
        });

        if (changed) {
            actuators.updatedAt = new Date();
            await actuatorDAO.save(actuators);
            this.publishActuators(actuators);
        }

        return actuators;
    }

    publishActuators(actuators) {
        const mqttClient = getMqttClient();
        if (mqttClient) {
            mqttClient.publish(
                "ecocomp/estufa-001/actuators",
                JSON.stringify({
                    bomba: actuators.bomba,
                    ventoinha: actuators.ventoinha,
                    lampada: actuators.lampada
                }),
                { retain: true }
            );
        }
    }
}

module.exports = new ActuatorService();
