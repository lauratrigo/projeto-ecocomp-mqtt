const { Router } = require("express");
const authController = require("../controllers/authController");

const router = Router();

router.post("/api/register", authController.register);
router.post("/api/login", authController.login);
router.post("/api/reset-password-direct", authController.resetPassword);

module.exports = router;
