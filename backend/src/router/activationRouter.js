const { Router } = require("express");
const activationController = require("../controller/activationController");

const router = Router();

router.get("/ativar", activationController.activate);

module.exports = router;
