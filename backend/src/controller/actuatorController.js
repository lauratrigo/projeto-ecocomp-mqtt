const actuatorService = require("../service/actuatorService");

class ActuatorController {
    async updateActuator(req, res) {
        try {
            const { tipo, ativo } = req.body;
            const actuators = await actuatorService.updateActuator(tipo, ativo);

            res.json({ message: "atuador atualizado", actuators });
        } catch (error) {
            console.error(error);
            res.status(500).json({ erro: "erro ao atualizar atuador" });
        }
    }

    async getActuators(req, res) {
        try {
            const actuators = await actuatorService.getActuators();
            res.json(actuators);
        } catch (error) {
            res.status(500).json({ erro: "erro ao buscar atuadores" });
        }
    }
}

module.exports = new ActuatorController();
