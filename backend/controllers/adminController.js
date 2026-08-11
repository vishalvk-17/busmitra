const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Trip = require("../models/Trip");
const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");

const audit = (actor, action, entityType, entityId, details = "") =>
  AuditLog.create({ actor, action, entityType, entityId, details });

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || user.role !== "admin" || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid super admin credentials" });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: "Your admin account is inactive" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return res.status(500).json({ success: false, message: "Failed to log in" }); }
};

const dashboard = async (req, res) => {
  try {
    const [users, driversPending, operatorsPending, busesPending, routesPending, activeTrips, complaintsOpen] = await Promise.all([
      User.countDocuments(), User.countDocuments({ role: "driver", isVerified: false }), User.countDocuments({ role: "operator", isVerified: false }),
      Bus.countDocuments({ isApproved: false }), Route.countDocuments({ isApproved: false }), Trip.countDocuments({ status: "running" }), Complaint.countDocuments({ status: { $in: ["open", "in_progress"] } }),
    ]);
    res.json({ success: true, stats: { users, driversPending, operatorsPending, busesPending, routesPending, activeTrips, complaintsOpen } });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to load dashboard" }); }
};

const listUsers = async (req, res) => {
  const users = await User.find().select("name email phone role isActive isVerified createdAt").sort({ createdAt: -1 });
  res.json({ success: true, users });
};
const setUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.isActive) }, { new: true }).select("name email role isActive");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  await audit(req.user.id, user.isActive ? "activated_user" : "deactivated_user", "User", user._id, user.email);
  res.json({ success: true, user });
};
const listRoleApprovals = (role) => async (req, res) => {
  const users = await User.find({ role, isVerified: false }).select("name email phone createdAt").sort({ createdAt: 1 });
  res.json({ success: true, users });
};
const approveUser = async (req, res) => {
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: { $in: ["driver", "operator"] } }, { isVerified: true }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: "Pending user not found" });
  await audit(req.user.id, "approved_user", "User", user._id, `${user.role}: ${user.email}`);
  res.json({ success: true, message: `${user.role} approved`, user });
};
const listApprovals = (Model, key) => async (req, res) => {
  const records = await Model.find({ isApproved: false }).populate("operator", "name email").sort({ createdAt: 1 });
  res.json({ success: true, [key]: records });
};
const listAllRoutes = async (req, res) => {
  const routes = await Route.find().populate("operator", "name email").populate("buses", "busNumber").sort({ createdAt: -1 });
  res.json({ success: true, routes });
};
const approveRecord = (Model, label) => async (req, res) => {
  const record = await Model.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!record) return res.status(404).json({ success: false, message: `${label} not found` });
  await audit(req.user.id, `approved_${label.toLowerCase()}`, label, record._id);
  res.json({ success: true, message: `${label} approved`, record });
};
const listTrips = async (req, res) => res.json({ success: true, trips: await Trip.find().populate("bus", "busNumber currentLocation").populate("driver", "name").populate("route", "routeName origin destination").sort({ scheduledStartTime: -1 }) });
const liveFleet = async (req, res) => res.json({ success: true, fleet: await Trip.find({ status: "running" }).populate("bus", "busNumber currentLocation").populate("driver", "name phone").populate("route", "routeName origin destination") });
const listComplaints = async (req, res) => res.json({ success: true, complaints: await Complaint.find().populate("user", "name email").sort({ createdAt: -1 }) });
const updateComplaint = async (req, res) => { const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status, adminNote: req.body.adminNote || "" }, { new: true }); if (!complaint) return res.status(404).json({ success:false,message:"Complaint not found" }); await audit(req.user.id, "updated_complaint", "Complaint", complaint._id, complaint.status); res.json({ success:true, complaint }); };
const listFeedback = async (req, res) => res.json({ success: true, feedback: await Feedback.find().populate("user", "name email").sort({ createdAt: -1 }) });
const listNotifications = async (req, res) => res.json({ success: true, notifications: await Notification.find().populate("user", "name email").sort({ createdAt: -1 }).limit(100) });
const sendNotification = async (req, res) => { const { userId, title, message } = req.body; if (!userId || !title || !message) return res.status(400).json({success:false,message:"Recipient, title and message are required"}); const notification = await Notification.create({ user:userId, type:"system", title, message }); const io = req.app.get("io"); if (io) io.to(`user:${userId}`).emit("notification-created", notification); await audit(req.user.id,"sent_notification","Notification",notification._id,title); res.status(201).json({success:true,notification}); };
const reports = async (req, res) => { const [tripStatus, usersByRole] = await Promise.all([Trip.aggregate([{ $group:{ _id:"$status", count:{ $sum:1 } } }]), User.aggregate([{ $group:{ _id:"$role", count:{ $sum:1 } } }])]); res.json({success:true,report:{tripStatus,usersByRole}}); };
const auditLogs = async (req, res) => res.json({ success:true, logs: await AuditLog.find().populate("actor","name email role").sort({createdAt:-1}).limit(200) });
const settings = async (req, res) => { if (req.method === "GET") { const admin = await User.findById(req.user.id).select("name email phone profileImage"); return res.json({success:true,admin}); } const admin = await User.findByIdAndUpdate(req.user.id, { name:req.body.name, phone:req.body.phone, profileImage:req.body.profileImage }, {new:true}).select("name email phone profileImage"); await audit(req.user.id,"updated_settings","User",req.user.id); return res.json({success:true,admin}); };

module.exports = { adminLogin, dashboard, listUsers, setUserStatus, listDrivers:listRoleApprovals("driver"), listOperators:listRoleApprovals("operator"), approveUser, listBuses:listApprovals(Bus,"buses"), listRoutes:listAllRoutes, approveBus:approveRecord(Bus,"Bus"), approveRoute:approveRecord(Route,"Route"), listTrips, liveFleet, listComplaints, updateComplaint, listFeedback, listNotifications, sendNotification, reports, auditLogs, settings };
