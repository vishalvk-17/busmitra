const express = require("express");
const { authorize } = require("../middleware/roleMiddleware");

const {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
} = require("../controllers/busController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getBuses);

router.get("/:id", getBusById);

router.post(
  "/",
  protect,
  authorize("operator", "admin"),
  createBus
);

router.put(
  "/:id",
  protect,
  authorize("operator", "admin"),
  updateBus
);

router.delete(
  "/:id",
  protect,
  authorize("operator", "admin"),
  deleteBus
);

module.exports = router;