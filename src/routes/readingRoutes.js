const { Router } = require("express");
const readingController = require("../controllers/readingController");

const router = Router();

router.post("/api/data", readingController.createReading);
router.get("/api/data", readingController.getReadings);

module.exports = router;
