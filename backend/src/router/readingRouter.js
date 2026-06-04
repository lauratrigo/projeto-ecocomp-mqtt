const { Router } = require("express");
const readingController = require("../controller/readingController");
const readingMiddleware = require("../middleware/readingMiddleware");

const router = Router();

router.post("/api/data", readingMiddleware.validateReading, readingController.createReading);
router.get("/api/data", readingMiddleware.validateReadingQuery, readingController.getReadings);

module.exports = router;
