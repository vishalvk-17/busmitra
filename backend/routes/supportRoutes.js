const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createComplaint, createFeedback } = require("../controllers/supportController");

const router = express.Router();

router.post("/complaints", protect, createComplaint);
router.post("/feedback", protect, createFeedback);

module.exports = router;
