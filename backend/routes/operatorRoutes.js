const express = require("express");
const bcrypt = require("bcryptjs");
const { loginOperator } = require("../controllers/operatorController");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/login", loginOperator);

router.use(protect, authorize("operator"));

router.get("/dashboard", async (req, res) => {
  try {
    const operator = req.user.id;
    const buses = await Bus.find({ operator }).select("_id status liveTracking");
    const busIds = buses.map((bus) => bus._id);
    const [drivers, routes, trips, runningTrips] = await Promise.all([
      User.countDocuments({ role: "driver", operator, isActive: true }),
      Route.countDocuments({ operator }),
      Trip.countDocuments({ bus: { $in: busIds } }),
      Trip.find({ bus: { $in: busIds }, status: "running" })
        .populate("bus", "busNumber")
        .populate("driver", "name phone")
        .populate("route", "routeName origin destination"),
    ]);

    return res.json({
      success: true,
      stats: {
        buses: buses.length,
        activeBuses: buses.filter((bus) => bus.status === "active").length,
        drivers,
        routes,
        trips,
        liveFleet: runningTrips.length,
      },
      runningTrips,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load dashboard" });
  }
});

router.get("/drivers", async (req, res) => {
  const drivers = await User.find({ role: "driver", operator: req.user.id })
    .select("name email phone isActive createdAt")
    .sort({ createdAt: -1 });
  res.json({ success: true, drivers });
});

router.post("/drivers", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Name, email, phone and password are required" });
    }
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (exists) {
      return res.status(409).json({ success: false, message: "A user with this email or phone already exists" });
    }
    const driver = await User.create({
      name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
      password: await bcrypt.hash(password, 12), role: "driver", operator: req.user.id,
    });
    return res.status(201).json({ success: true, message: "Driver added successfully", driver: {
      id: driver._id, name: driver.name, email: driver.email, phone: driver.phone, role: driver.role,
    }});
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add driver" });
  }
});

router.get("/buses", async (req, res) => {
  const buses = await Bus.find({ operator: req.user.id })
    .populate("driver", "name phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, buses });
});

router.get("/routes", async (req, res) => {
  const routes = await Route.find({ operator: req.user.id })
    .populate("buses", "busNumber status")
    .sort({ createdAt: -1 });
  res.json({ success: true, routes });
});

router.get("/trips", async (req, res) => {
  const busIds = await Bus.find({ operator: req.user.id }).distinct("_id");
  const trips = await Trip.find({ bus: { $in: busIds } })
    .populate("bus", "busNumber status")
    .populate("driver", "name phone")
    .populate("route", "routeName origin destination")
    .sort({ tripDate: -1, scheduledStartTime: -1 });
  res.json({ success: true, trips });
});

router.get("/fleet", async (req, res) => {
  const busIds = await Bus.find({ operator: req.user.id }).distinct("_id");
  const fleet = await Trip.find({ bus: { $in: busIds }, status: "running" })
    .populate("bus", "busNumber currentLocation")
    .populate("driver", "name phone")
    .populate("route", "routeName origin destination");
  res.json({ success: true, fleet });
});

router.get("/reports", async (req, res) => {
  const busIds = await Bus.find({ operator: req.user.id }).distinct("_id");
  const byStatus = await Trip.aggregate([
    { $match: { bus: { $in: busIds } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  res.json({ success: true, report: { tripStatus: byStatus } });
});

module.exports = router;
