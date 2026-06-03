const mongoose = require("mongoose");

async function connectDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Mongo conectado");
    } catch (error) {
        console.log("Erro Mongo:", error);
    }
}

module.exports = connectDatabase;
