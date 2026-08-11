const express = require("express");

const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

const router =
  express.Router();

// Get logged-in user's favorites
router.get(
  "/",
  protect,
  getMyFavorites
);

// Add favorite
router.post(
  "/",
  protect,
  addFavorite
);

// Check favorite
router.get(
  "/check/:type/:id",
  protect,
  checkFavorite
);

// Remove favorite
router.delete(
  "/:id",
  protect,
  removeFavorite
);

module.exports = router;
