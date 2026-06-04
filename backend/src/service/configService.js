const configDAO = require("../dao/configDAO");

class ConfigService {
    validateConfig({ soloMin, tempMax, tempMin }) {
        if (soloMin < 0 || soloMin > 100) {
            return "soloMin invalido";
        }

        if (tempMax < 0 || tempMax > 60) {
            return "tempMax invalido";
        }

        if (tempMin < 0 || tempMin > 60) {
            return "tempMin invalido";
        }

        if (tempMin >= tempMax) {
            return "tempMin deve ser menor que tempMax";
        }

        return null;
    }

    async saveConfig({ soloMin, tempMax, tempMin }) {
        const validationError = this.validateConfig({ soloMin, tempMax, tempMin });

        if (validationError) {
            const error = new Error(validationError);
            error.statusCode = 400;
            throw error;
        }

        let config = await configDAO.findCurrent();
        if (!config) config = await configDAO.create();

        config.soloMin = soloMin;
        config.tempMax = tempMax;
        config.tempMin = tempMin;

        await configDAO.save(config);
        return config;
    }

    async getConfig() {
        let config = await configDAO.findCurrent();

        if (!config) {
            config = await configDAO.create({ soloMin: 40, tempMax: 32, tempMin: 18 });
        }

        return config;
    }
}

module.exports = new ConfigService();
