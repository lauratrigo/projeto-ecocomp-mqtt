const { Router } = require("express");
const healthController = require("../controller/healthController");

const router = Router();

router.get("/health", healthController.health);

module.exports = router;
