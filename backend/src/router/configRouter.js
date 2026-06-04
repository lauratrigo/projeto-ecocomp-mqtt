const { Router } = require("express");
const configController = require("../controller/configController");
const configMiddleware = require("../middleware/configMiddleware");

const router = Router();

router.post("/api/config", configMiddleware.validateConfig, configController.saveConfig);
router.get("/api/config", configController.getConfig);

module.exports = router;
