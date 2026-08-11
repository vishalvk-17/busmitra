const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");

const createComplaint = async (req, res) => {
  try {
    const { subject, description, category } = req.body;
    if (!subject || !description) return res.status(400).json({ success: false, message: "Subject and description are required" });
    const complaint = await Complaint.create({ user: req.user.id, subject, description, category: category || "other" });
    return res.status(201).json({ success: true, message: "Complaint submitted", complaint });
  } catch (error) { return res.status(500).json({ success: false, message: "Failed to submit complaint" }); }
};

const createFeedback = async (req, res) => {
  try {
    const { rating, message } = req.body;
    if (!rating || !message) return res.status(400).json({ success: false, message: "Rating and message are required" });
    const feedback = await Feedback.create({ user: req.user.id, rating, message });
    return res.status(201).json({ success: true, message: "Feedback submitted", feedback });
  } catch (error) { return res.status(500).json({ success: false, message: "Failed to submit feedback" }); }
};

module.exports = { createComplaint, createFeedback };
