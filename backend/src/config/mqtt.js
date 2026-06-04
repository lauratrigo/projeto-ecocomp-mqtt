const mqtt = require("mqtt");

let mqttClient;

async function publishCurrentState() {
    try {
        const configService = require("../service/configService");
        const actuatorService = require("../service/actuatorService");

        const [config, actuators] = await Promise.all([
            configService.getConfig(),
            actuatorService.getActuators()
        ]);

        configService.publishConfig(config);
        actuatorService.publishActuators(actuators);
    } catch (error) {
        console.error("Erro ao publicar estado MQTT:", error);
    }
}

function connectMqtt() {
    mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

    mqttClient.on("connect", () => {
        console.log("MQTT conectado");
        mqttClient.subscribe("ecocomp/+/telemetry");
        publishCurrentState();
    });

    mqttClient.on("message", async (topic, message) => {
        try {
            const telemetryService = require("../service/telemetryService");
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
