const readingService = require("../services/readingService");

async function createReading(req, res) {
    try {
        const data = await readingService.createReading(req.body);
        res.json({ message: "dados salvos", data });
    } catch (error) {
        res.status(500).json({ erro: "erro ao salvar dados" });
    }
}

async function getReadings(req, res) {
    try {
        const { deviceId } = req.query;
        const limit = parseInt(req.query.limit, 10) || 500;

        if (!deviceId) {
            return res.status(400).json({ erro: "deviceId nao informado" });
        }

        const data = await readingService.getReadingsByDevice(deviceId, limit);
        return res.json(data);
    } catch (error) {
        return res.status(500).json({ erro: "erro ao buscar dados" });
    }
}

module.exports = {
    createReading,
    getReadings
};
