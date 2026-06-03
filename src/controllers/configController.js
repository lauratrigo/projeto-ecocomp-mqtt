const configService = require("../services/configService");

async function saveConfig(req, res) {
    try {
        const config = await configService.saveConfig(req.body);
        res.json({
            message: "configuracao salva",
            config
        });
    } catch (error) {
        if (error.statusCode === 400) {
            return res.status(400).json({ erro: error.message });
        }

        return res.status(500).json({ erro: "erro ao salvar config" });
    }
}

async function getConfig(req, res) {
    try {
        const config = await configService.getConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ erro: "erro ao buscar config" });
    }
}

module.exports = {
    getConfig,
    saveConfig
};
