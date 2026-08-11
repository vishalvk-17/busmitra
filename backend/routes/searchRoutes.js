const express = require("express");

const {
  searchBuses,
} = require("../controllers/searchController");

const router = express.Router();

// Public bus search
router.get("/buses", searchBuses);

module.exports = router;