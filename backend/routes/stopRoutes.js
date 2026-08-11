const express = require("express");

const {
  createStop,
  getStops,
  getStopById,
  updateStop,
  deleteStop,
} = require("../controllers/stopController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public
router.get("/", getStops);

router.get("/:id", getStopById);

// Operator + Admin
router.post(
  "/",
  protect,
  authorize("operator", "admin"),
  createStop
);

router.put(
  "/:id",
  protect,
  authorize("operator", "admin"),
  updateStop
);

router.delete(
  "/:id",
  protect,
  authorize("operator", "admin"),
  deleteStop
);

module.exports = router;