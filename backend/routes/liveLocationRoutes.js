const express = require("express");

const {
  updateLiveLocation,
  getLatestLocation,
} = require("../controllers/liveLocationController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Driver sends GPS location
router.post(
  "/:tripId",
  protect,
  authorize("driver", "operator", "admin"),
  updateLiveLocation
);

// Passenger can fetch latest location
router.get(
  "/:tripId/latest",
  getLatestLocation
);

module.exports = router;