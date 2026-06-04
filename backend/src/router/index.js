const { Router } = require("express");

const healthRoutes = require("./healthRouter");
const actuatorRoutes = require("./actuatorRouter");
const configRoutes = require("./configRouter");
const readingRoutes = require("./readingRouter");
const authRoutes = require("./authRouter");
const activationRoutes = require("./activationRouter");
const deviceRoutes = require("./deviceRouter");

const router = Router();

router.use(healthRoutes);
router.use(actuatorRoutes);
router.use(configRoutes);
router.use(readingRoutes);
router.use(authRoutes);
router.use(activationRoutes);
router.use(deviceRoutes);

module.exports = router;
