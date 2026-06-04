const Config = require("../model/Config");

class ConfigDAO {
    async findCurrent() {
        return Config.findOne();
    }

    async create(data = {}) {
        return new Config(data).save();
    }

    async save(config) {
        return config.save();
    }
}

module.exports = new ConfigDAO();
