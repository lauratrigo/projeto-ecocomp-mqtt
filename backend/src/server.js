const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = require("./app");
const connectDatabase = require("./config/database");
const { connectMqtt } = require("./config/mqtt");

const PORT = process.env.PORT || 3000;

function startServer() {
    connectDatabase();
    connectMqtt();

    app.listen(PORT, () => {
        console.log("Server rodando na porta", PORT);
    });
}

startServer();
