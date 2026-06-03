const { Router } = require("express");
const actuatorController = require("../controllers/actuatorController");

const router = Router();

router.post("/api/actuators", actuatorController.updateActuator);
router.get("/api/actuators", actuatorController.getActuators);

module.exports = router;
