const readingDAO = require("../dao/readingDAO");
const configService = require("../service/configService");
const actuatorService = require("../service/actuatorService");

class TelemetryService {
    validateTelemetry(payload) {
        const { deviceId, soil, airTemp, airHumidity } = payload;

        if (!deviceId) {
            console.log("MQTT sem deviceId");
            return false;
        }

        if (soil < 0 || soil > 100) {
            console.log("Umidade do solo invalida");
            return false;
        }

        if (airHumidity < 0 || airHumidity > 100) {
            console.log("Umidade do ar invalida");
            return false;
        }

        if (airTemp < -20 || airTemp > 80) {
            console.log("Temperatura invalida");
            return false;
        }

        return true;
    }

    async applyAutomation(payload) {
        const config = await configService.getConfig();
        const actuators = await actuatorService.getActuators();

        const desiredStates = {
            bomba: payload.soil <= config.soloMin,
            ventoinha: payload.airTemp >= config.tempMax,
            lampada: payload.airTemp <= config.tempMin
        };

        // Só atualiza se houver mudança real no estado dos atuadores
        const stateChanged = Object.keys(desiredStates).some(
            (key) => actuators[key] !== desiredStates[key]
        );

        if (stateChanged) {
            await actuatorService.setActuators(desiredStates);
        }
    }

    async saveTelemetry(payload) {
        const {
            deviceId,
            soil,
            airTemp,
            airHumidity,
            soilExternal,
            airHumidityExternal,
            tempExternal
        } = payload;

        const reading = await readingDAO.create({
            deviceId,
            soil,
            airTemp,
            airHumidity,
            soilExternal,
            airHumidityExternal,
            tempExternal
        });

        console.log("Dado salvo MQTT:", deviceId);
        await this.applyAutomation(payload);

        return reading;
    }

    async saveFromMqttMessage(message) {
        const payload = JSON.parse(message.toString());

        if (!this.validateTelemetry(payload)) {
            return null;
        }

        return this.saveTelemetry(payload);
    }
}

module.exports = new TelemetryService();
