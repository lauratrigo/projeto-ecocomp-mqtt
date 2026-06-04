const mqtt = require("mqtt");
const telemetryService = require("../service/telemetryService");

let mqttClient;

function connectMqtt() {
    mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

    mqttClient.on("connect", () => {
        console.log("MQTT conectado");
        mqttClient.subscribe("ecocomp/+/telemetry");
    });

    mqttClient.on("message", async (topic, message) => {
        try {
            await telemetryService.saveFromMqttMessage(message);
        } catch (error) {
            console.error("Erro MQTT:", error);
        }
    });

    return mqttClient;
}

function getMqttClient() {
    return mqttClient;
}

module.exports = {
    connectMqtt,
    getMqttClient
};
