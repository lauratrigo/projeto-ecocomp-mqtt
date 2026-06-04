const { Router } = require("express");
const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = Router();

router.post("/api/register", authMiddleware.validateRegister, authController.register);
router.post("/api/login", authMiddleware.validateLogin, authController.login);
router.post("/api/reset-password-direct", authMiddleware.validateResetPassword, authController.resetPassword);

module.exports = router;
