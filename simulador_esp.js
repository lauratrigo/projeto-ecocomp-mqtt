const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost");

function gerarDados() {
  return {
    deviceId: "estufa-001",
    soil: Math.floor(Math.random() * 100),
    airTemp: 20 + Math.random() * 10,
    airHumidity: 50 + Math.random() * 30
  };
}

client.on("connect", () => {
  console.log("Simulador ESP32 conectado");

  setInterval(() => {
    const payload = gerarDados();

    client.publish(
      "ecocomp/estufa-001/telemetry",
      JSON.stringify(payload)
    );

    console.log("Enviado:", payload);
  }, 3000);
});