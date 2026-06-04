const readingDAO = require("../dao/readingDAO");

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
