const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ["new", "reviewed", "archived"], default: "new" },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
