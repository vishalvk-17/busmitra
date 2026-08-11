const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, enum: ["service", "driver", "bus", "route", "payment", "other"], default: "other" },
  status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
  adminNote: { type: String, default: "", trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
