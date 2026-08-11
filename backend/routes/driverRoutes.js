const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { loginDriver, getMyTrips } = require("../controllers/driverController");

const router = express.Router();

router.post("/login", loginDriver);
router.get("/trips", protect, authorize("driver"), getMyTrips);

module.exports = router;
