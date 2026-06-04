const Actuator = require("../model/Actuator");

class ActuatorDAO {
    async findCurrent() {
        return Actuator.findOne();
    }

    async create(data = {}) {
        return new Actuator(data).save();
    }

    async save(actuator) {
        return actuator.save();
    }
}

module.exports = new ActuatorDAO();
