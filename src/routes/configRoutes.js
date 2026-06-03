const { Router } = require("express");
const configController = require("../controllers/configController");

const router = Router();

router.post("/api/config", configController.saveConfig);
router.get("/api/config", configController.getConfig);

module.exports = router;
