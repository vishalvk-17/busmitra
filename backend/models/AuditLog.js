const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true, trim: true },
  entityType: { type: String, required: true, trim: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: String, default: "", trim: true },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
module.exports = mongoose.model("AuditLog", auditLogSchema);
