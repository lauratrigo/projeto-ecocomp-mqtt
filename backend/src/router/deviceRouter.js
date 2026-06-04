const { Router } = require("express");
const deviceController = require("../controller/deviceController");

const router = Router();

router.get("/test-device", deviceController.testDevice);

module.exports = router;
