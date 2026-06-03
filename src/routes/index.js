const { Router } = require("express");

const healthRoutes = require("./healthRoutes");
const actuatorRoutes = require("./actuatorRoutes");
const configRoutes = require("./configRoutes");
const readingRoutes = require("./readingRoutes");
const authRoutes = require("./authRoutes");
const activationRoutes = require("./activationRoutes");
const deviceRoutes = require("./deviceRoutes");

const router = Router();

router.use(healthRoutes);
router.use(actuatorRoutes);
router.use(configRoutes);
router.use(readingRoutes);
router.use(authRoutes);
router.use(activationRoutes);
router.use(deviceRoutes);

module.exports = router;
