/* =========================================================
   ECOCOMP BACKEND API
   ---------------------------------------------------------
   Backend responsável por:

   - Receber dados dos sensores da ESP32 via MQTT
   - Armazenar leituras no MongoDB
   - Disponibilizar dados para o frontend
   - Controlar atuadores da estufa
   - Gerenciar configurações automáticas
   - Gerenciar autenticação de usuários
   ========================================================= */

const express = require("express"); // framework principal da api
const mongoose = require("mongoose"); // odm para comunicação com mongodb
const cors = require("cors"); // permite acesso da aplicação frontend

require("dotenv").config(); // carrega variáveis do arquivo .env

const app = express(); // criação da aplicação express
app.use(cors()); // habilita requisições de outros domínios
app.use(express.json()); // permite receber json nas requisições

const PORT = process.env.PORT || 3000; // porta do servidor

/* =========================================================
   CONEXÃO COM BANCO DE DADOS
   ---------------------------------------------------------
   Conecta a API ao MongoDB Atlas utilizando a URI
   armazenada nas variáveis de ambiente
   ========================================================= */

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Mongo conectado"))
    .catch(err => console.log("Erro Mongo:", err));

/* =========================================================
   MQTT
   ---------------------------------------------------------
   Responsável pela comunicação em tempo real
   com as ESP32

   Tópicos utilizados:

   ecocomp/estufa-001/telemetry
   → sensores para servidor

   ecocomp/estufa-001/actuators
   → servidor para ESP32

   ecocomp/estufa-001/config
   → servidor para ESP32
   ========================================================= */

const mqtt = require("mqtt");

const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL); // cria cliente mqtt conectado ao broker

// quando conectado do broker
mqttClient.on("connect", () => {
    console.log("MQTT conectado");
    // escuta todos os tópicos de telemetria
    mqttClient.subscribe("ecocomp/+/telemetry");
});

/* =========================================================
   RECEBIMENTO DE TELEMETRIA
   ---------------------------------------------------------
   Toda vez que uma ESP32 publicar dados dos sensores,
   a mensagem é recebida, convertida para JSON e
   armazenada no MongoDB
   ========================================================= */

mqttClient.on("message", async (topic, message) => {
    try {
        const payload = JSON.parse(message.toString());

        const {
            deviceId,
            soil,
            airTemp,
            airHumidity,
            soilExternal,
            airHumidityExternal,
            tempExternal
        } = payload;

        await new Reading({
            deviceId,
            soil,
            airTemp,
            airHumidity,
            soilExternal,
            airHumidityExternal,
            tempExternal
        }).save();

        console.log("Dado salvo MQTT:", deviceId);

    } catch (err) {
        console.error("Erro MQTT:", err);
    }
});

/* =========================================================
   SCHEMA DE LEITURAS
   ---------------------------------------------------------
   Armazena histórico dos sensores internos e externos
   ========================================================= */

// histórico das leituras dos sensores
const ReadingSchema = new mongoose.Schema({
    deviceId: String, // id de cada esp de cada estufa
    soil: Number,               // interno
    airHumidity: Number,        // interno
    airTemp: Number,            // interno
    soilExternal: Number,       // externo
    airHumidityExternal: Number,// externo
    tempExternal: Number,       // externo
    createdAt: { type: Date, default: Date.now }
});

/* =========================================================
   SCHEMA DE ESTUFAS
   ---------------------------------------------------------
   Representa uma estufa cadastrada no sistema
   ========================================================= */
const DeviceSchema = new mongoose.Schema({
    deviceId: String,
    name: String,
    location: String,
    active: Boolean
});

const Device = mongoose.model("Device", DeviceSchema, "devices");

/* =========================================================
   SCHEMA DE ATUADORES
   ---------------------------------------------------------
   Armazena estado atual dos dispositivos controlados
   remotamente
   ========================================================= */
const ActuatorSchema = new mongoose.Schema({
    bomba: { type: Boolean, default: false },
    ventoinha: { type: Boolean, default: false },
    lampada: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
});

/* =========================================================
   SCHEMA DE CONFIGURAÇÃO AUTOMÁTICA
   ---------------------------------------------------------
   Define limites para acionamento automático:
   - Umidade mínima do solo
   - Temperatura máxima
   - Temperatura mínima
   ========================================================= */
const ConfigSchema = new mongoose.Schema({
    soloMin: Number,
    tempMax: Number,
    tempMin: Number
});

/* =========================================================
   MODELS
   ---------------------------------------------------------
   Interfaces utilizadas para manipular documentos
   do MongoDB
   ========================================================= */
const Reading = mongoose.model("Reading", ReadingSchema);
const Actuator = mongoose.model("Actuator", ActuatorSchema);
const Config = mongoose.model("Config", ConfigSchema);

/* =========================================================
   HEALTH CHECK
   ---------------------------------------------------------
   Endpoint utilizado para verificar se a API está
   online
   ========================================================= */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/* =========================================================
   ATUALIZAR ATUADORES
   ---------------------------------------------------------
   Recebe comando do frontend, salva no MongoDB
   e publica via MQTT para a ESP32
   ========================================================= */
app.post("/api/actuators", async (req, res) => {
    try {
        const { tipo, ativo } = req.body;

        let actuators = await Actuator.findOne();
        if (!actuators) actuators = new Actuator();

        actuators[tipo] = ativo;
        actuators.updatedAt = new Date();

        await actuators.save();
        
       // envia novo estado para a esp32 em tempo real
        mqttClient.publish(
            "ecocomp/estufa-001/actuators",
            JSON.stringify(actuators)
        );
        
        res.json({ message: "atuador atualizado", actuators });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "erro ao atualizar atuador" });
    }
});


/* =========================================================
   CONSULTAR ATUADORES
   ---------------------------------------------------------
   Retorna o estado atual dos atuadores
   ========================================================= */
app.get("/api/actuators", async (req, res) => {
    try {
        let actuators = await Actuator.findOne();
        if (!actuators) {
            actuators = new Actuator();
            await actuators.save();
        }
        res.json(actuators);
    } catch (error) {
        res.status(500).json({ erro: "erro ao buscar atuadores" });
    }
});

/* =========================================================
   SALVAR CONFIGURAÇÃO AUTOMÁTICA
   ---------------------------------------------------------
   Atualiza os limites utilizados pela lógica automática
   da estufa
   ========================================================= */
app.post("/api/config", async (req, res) => {
    try {
        const { soloMin, tempMax, tempMin } = req.body;

        let config = await Config.findOne();
        if (!config) config = new Config();

        config.soloMin = soloMin;
        config.tempMax = tempMax;
        config.tempMin = tempMin;

        await config.save();
        res.json({ message: "configuração salva", config });
    } catch (error) {
        res.status(500).json({ erro: "erro ao salvar config" });
    }
});

/* =========================================================
   CONSULTAR CONFIGURAÇÃO
   ---------------------------------------------------------
   Retorna os parâmetros automáticos atuais
   ========================================================= */
app.get("/api/config", async (req, res) => {
    try {
        let config = await Config.findOne();
        if (!config) {
            config = new Config({ soloMin: 40, tempMax: 32, tempMin: 18 });
            await config.save();
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ erro: "erro ao buscar config" });
    }
});

/* =========================================================
   RECEBER LEITURAS VIA HTTP
   ---------------------------------------------------------
   Mantido para compatibilidade com versões antigas
   da ESP32
   ========================================================= */
app.post("/api/data", async (req, res) => {
    try {
        const {
            deviceId,
            soil, 
            airHumidity, 
            airTemp,
            soilExternal, 
            airHumidityExternal, 
            tempExternal
        } = req.body;

        const data = new Reading({
            deviceId,
            soil: soil ?? 0,
            airHumidity: airHumidity ?? 0,
            airTemp: airTemp ?? 0,
            soilExternal: soilExternal ?? 0,
            airHumidityExternal: airHumidityExternal ?? 0,
            tempExternal: tempExternal ?? 0
        });

        await data.save();
        res.json({ message: "dados salvos", data });
    } catch (error) {
        res.status(500).json({ erro: "erro ao salvar dados" });
    }
});

/* =========================================================
   HISTÓRICO DE LEITURAS
   ---------------------------------------------------------
   Retorna as últimas leituras de uma estufa
   específica para exibição em gráficos
   ========================================================= */
app.get("/api/data", async (req, res) => {
    try {
        const { deviceId } = req.query;
        const limit = parseInt(req.query.limit) || 500;

        if (!deviceId) {
            return res.status(400).json({ erro: "deviceId não informado" });
        }

        const data = await Reading.find({ deviceId }) 
            .sort({ createdAt: -1 })
            .limit(limit);

        const dadosFormatados = data.map(item => ({
            createdAt: item.createdAt,

            // interno
            soil: item.soil ?? 0,
            airHumidity: item.airHumidity ?? 0,
            airTemp: item.airTemp ?? 0,

            // externo
            soilExternal: item.soilExternal ?? 0,
            airHumidityExternal: item.airHumidityExternal ?? 0,
            tempExternal: item.tempExternal ?? 0
        }));

        res.json(dadosFormatados);
    } catch (error) {
        res.status(500).json({ erro: "erro ao buscar dados" });
    }
});

/* ================================
   INICIA O SERVIDOR
================================ */
app.listen(PORT, () => {
    console.log("Server rodando na porta", PORT);
});

const bcrypt = require("bcrypt");

/* =========================================================
   USUÁRIOS
   ---------------------------------------------------------
   Armazena credenciais e estufas vinculadas ao usuário
   ========================================================= */
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    devices: [String], 
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", UserSchema);

/* =========================================================
   CADASTRO DE USUÁRIO
   ---------------------------------------------------------
   Cria novo usuário e vincula uma estufa existente
   A senha é armazenada utilizando hash bcrypt
   ========================================================= */
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ erro: "deviceId não enviado" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ erro: "Email já cadastrado" });
        }

        const device = await Device.findOne({ deviceId });

        if (!device) {
            return res.status(400).json({ erro: "Estufa inválida" });
        }

       const deviceAlreadyLinked = await User.findOne({
          devices: deviceId
      });
      
       if (deviceAlreadyLinked) {
           return res.status(400).json({
               erro: "Esta estufa já está vinculada a outro usuário"
           });
       }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            devices: [device.deviceId]
        });

        await user.save();

        return res.json({ message: "Usuário criado com sucesso" });

    } catch (error) {
        console.error("ERRO REGISTER:", error);
        return res.status(500).json({
            erro: "Erro interno no servidor",
            detalhe: error.message
        });
    }
});

/* =========================================================
   LOGIN
   ---------------------------------------------------------
   Valida email e senha do usuário
   ========================================================= */
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ erro: "Usuário não encontrado" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ erro: "Senha incorreta" });
        }

        res.json({ message: "Login OK", user: { id: user._id, name: user.name } });

    } catch (error) {
        res.status(500).json({ erro: "Erro no login" });
    }
});

app.get("/ativar", (req, res) => {
    const deviceId = req.query.device;

    if (!deviceId) {
        return res.status(400).send("Device inválido");
    }

    return res.redirect(
        `https://lauratrigo.github.io/projeto-ecocomp/cadastro.html?device=${deviceId}`
    );
});

/* =========================================================
   RESET DE SENHA
   ---------------------------------------------------------
   Permite alterar a senha do usuário
   ========================================================= */
app.post("/api/reset-password-direct", async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ erro: "Usuário não encontrado" });
        }

        const bcrypt = require("bcrypt");
        const hash = await bcrypt.hash(newPassword, 10);

        user.password = hash;
        await user.save();

        res.json({ message: "Senha alterada com sucesso" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: "Erro ao alterar senha" });
    }
});

app.get("/test-device", async (req, res) => {
    const d = await Device.findOne({ deviceId: "estufa-001" });
    res.json(d);
});
