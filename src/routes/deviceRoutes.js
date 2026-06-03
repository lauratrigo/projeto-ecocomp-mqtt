const { Router } = require("express");
const deviceController = require("../controllers/deviceController");

const router = Router();

router.get("/test-device", deviceController.testDevice);

module.exports = router;
