const express = require("express");

const {
  createTrip,
  getTrips,
  getTripById,
  startTrip,
  endTrip,
  cancelTrip,
} = require("../controllers/tripController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public
router.get("/", getTrips);
router.get("/:id", getTripById);

// Operator + Admin
router.post(
  "/",
  protect,
  authorize("operator", "admin"),
  createTrip
);

router.put(
  "/:id/cancel",
  protect,
  authorize("operator", "admin"),
  cancelTrip
);

// Driver + Operator + Admin
router.put(
  "/:id/start",
  protect,
  authorize("driver", "operator", "admin"),
  startTrip
);

router.put(
  "/:id/end",
  protect,
  authorize("driver", "operator", "admin"),
  endTrip
);

module.exports = router;