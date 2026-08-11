const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Trip = require("../models/Trip");

// POST /api/drivers/login
const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const driver = await User.findOne({ email: email.trim().toLowerCase(), role: "driver" }).select("+password");
    if (!driver || !(await bcrypt.compare(password, driver.password))) return res.status(401).json({ success: false, message: "Invalid driver email or password" });
    if (!driver.isActive) return res.status(403).json({ success: false, message: "Your driver account is inactive" });
    const token = jwt.sign({ id: driver._id, role: driver.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, message: "Driver login successful", token, user: { id: driver._id, name: driver.name, email: driver.email, phone: driver.phone, role: driver.role } });
  } catch (error) { return res.status(500).json({ success: false, message: "Failed to log in driver" }); }
};

// GET /api/drivers/trips
const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id, status: { $in: ["scheduled", "boarding", "running", "paused"] } })
      .populate("bus", "busNumber registrationNumber")
      .populate("route", "routeName origin destination")
      .sort({ scheduledStartTime: 1 });
    return res.json({ success: true, trips });
  } catch (error) { return res.status(500).json({ success: false, message: "Failed to load assigned trips" }); }
};

module.exports = { loginDriver, getMyTrips };
