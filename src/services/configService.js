const Config = require("../models/Config");

function validateConfig({ soloMin, tempMax, tempMin }) {
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

async function saveConfig({ soloMin, tempMax, tempMin }) {
    const validationError = validateConfig({ soloMin, tempMax, tempMin });

    if (validationError) {
        const error = new Error(validationError);
        error.statusCode = 400;
        throw error;
    }

    let config = await Config.findOne();
    if (!config) config = new Config();

    config.soloMin = soloMin;
    config.tempMax = tempMax;
    config.tempMin = tempMin;

    await config.save();
    return config;
}

async function getConfig() {
    let config = await Config.findOne();

    if (!config) {
        config = new Config({ soloMin: 40, tempMax: 32, tempMin: 18 });
        await config.save();
    }

    return config;
}

module.exports = {
    getConfig,
    saveConfig
};
