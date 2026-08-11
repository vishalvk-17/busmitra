const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const admin = require("../controllers/adminController");

const router = express.Router();

router.post("/login", admin.adminLogin);
router.use(protect, authorize("admin"));

router.get("/dashboard", admin.dashboard);
router.get("/users", admin.listUsers);
router.patch("/users/:id/status", admin.setUserStatus);
router.get("/approvals/drivers", admin.listDrivers);
router.get("/approvals/operators", admin.listOperators);
router.patch("/approvals/users/:id", admin.approveUser);
router.get("/approvals/buses", admin.listBuses);
router.patch("/approvals/buses/:id", admin.approveBus);
router.get("/routes", admin.listRoutes);
router.patch("/routes/:id/approve", admin.approveRoute);
router.get("/trips", admin.listTrips);
router.get("/fleet", admin.liveFleet);
router.get("/complaints", admin.listComplaints);
router.patch("/complaints/:id", admin.updateComplaint);
router.get("/feedback", admin.listFeedback);
router.get("/notifications", admin.listNotifications);
router.post("/notifications", admin.sendNotification);
router.get("/reports", admin.reports);
router.get("/audit-logs", admin.auditLogs);
router.route("/settings").get(admin.settings).put(admin.settings);

module.exports = router;
