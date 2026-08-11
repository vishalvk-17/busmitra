const express = require("express");

const {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
} = require("../controllers/routeController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

// Public
router.get("/", getRoutes);

router.get("/:id", getRouteById);

// Operator + Admin
router.post(
  "/",
  protect,
  authorize("operator", "admin"),
  createRoute
);

router.put(
  "/:id",
  protect,
  authorize("operator", "admin"),
  updateRoute
);

router.delete(
  "/:id",
  protect,
  authorize("operator", "admin"),
  deleteRoute
);

module.exports = router;