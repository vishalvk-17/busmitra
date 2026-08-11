const Trip = require("../models/Trip");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const User = require("../models/User");

// =====================================================
// CREATE / SCHEDULE TRIP
// POST /api/trips
// Allowed: operator, admin
// =====================================================
const createTrip = async (req, res) => {
  try {
    const {
      bus,
      driver,
      route,
      tripDate,
      scheduledStartTime,
      scheduledEndTime,
    } = req.body;

    if (
      !bus ||
      !driver ||
      !route ||
      !tripDate ||
      !scheduledStartTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bus, driver, route, trip date and scheduled start time are required",
      });
    }

    const busData = await Bus.findById(bus);

    if (!busData) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const routeData = await Route.findById(route);

    if (!routeData) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    if (
      req.user.role === "operator" &&
      routeData.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only schedule trips on your own routes",
      });
    }

    const driverData = await User.findOne({
      _id: driver,
      role: "driver",
    });

    if (!driverData) {
      return res.status(400).json({
        success: false,
        message: "Selected driver is invalid",
      });
    }

    if (
      req.user.role === "operator" &&
      driverData.operator?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only schedule trips with your own drivers",
      });
    }

    // Operator can schedule only their own bus
    if (
      req.user.role === "operator" &&
      busData.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only schedule trips for your own buses",
      });
    }

    // Check whether bus already has an active trip
    const activeTrip = await Trip.findOne({
      bus,
      status: {
        $in: ["boarding", "running", "paused"],
      },
    });

    if (activeTrip) {
      return res.status(409).json({
        success: false,
        message: "This bus already has an active trip",
      });
    }

    const trip = await Trip.create({
      bus,
      driver,
      route,
      tripDate,
      scheduledStartTime,
      scheduledEndTime: scheduledEndTime || null,
      status: "scheduled",
      liveTracking: false,
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate(
        "bus",
        "busNumber registrationNumber busType totalSeats"
      )
      .populate(
        "driver",
        "name phone profileImage"
      )
      .populate(
        "route",
        "routeName routeNumber origin destination distanceKm estimatedDurationMinutes"
      );

    return res.status(201).json({
      success: true,
      message: "Trip scheduled successfully",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("Create Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create trip",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL TRIPS
// GET /api/trips
// =====================================================
const getTrips = async (req, res) => {
  try {
    const {
      status,
      bus,
      driver,
      route,
      date,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (bus) filter.bus = bus;
    if (driver) filter.driver = driver;
    if (route) filter.route = route;

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      filter.tripDate = {
        $gte: start,
        $lt: end,
      };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const trips = await Trip.find(filter)
      .populate(
        "bus",
        "busNumber registrationNumber busType"
      )
      .populate(
        "driver",
        "name phone profileImage"
      )
      .populate(
        "route",
        "routeName routeNumber origin destination"
      )
      .populate(
        "currentStop",
        "name city sequence"
      )
      .populate(
        "nextStop",
        "name city sequence"
      )
      .skip(skip)
      .limit(limitNumber)
      .sort({
        tripDate: -1,
        scheduledStartTime: -1,
      });

    const total = await Trip.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: trips.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      trips,
    });
  } catch (error) {
    console.error("Get Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trips",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE TRIP
// GET /api/trips/:id
// =====================================================
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate(
        "bus",
        "busNumber registrationNumber busType totalSeats availableSeats status liveTracking currentLocation"
      )
      .populate(
        "driver",
        "name phone profileImage"
      )
      .populate({
        path: "route",
        select: `
          routeName
          routeNumber
          origin
          destination
          distanceKm
          estimatedDurationMinutes
          fare
          firstBusTime
          lastBusTime
        `,
        populate: {
          path: "stops",
          select: `
            name
            city
            address
            sequence
            estimatedArrivalMinutes
            location
          `,
          options: {
            sort: {
              sequence: 1,
            },
          },
        },
      })
      .populate(
        "currentStop",
        "name city address sequence location"
      )
      .populate(
        "nextStop",
        "name city address sequence location"
      );

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error(
      "Get Trip By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip",
      error: error.message,
    });
  }
};

// =====================================================
// START TRIP
// PUT /api/trips/:id/start
// Allowed: driver, operator, admin
// =====================================================
const startTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (req.user.role === "operator") {
      const bus = await Bus.findById(trip.bus).select("operator");
      if (!bus || bus.operator.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "You can only manage your own trips" });
      }
    }

    // Driver ownership check
    if (
      req.user.role === "driver" &&
      trip.driver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this trip",
      });
    }

    if (trip.status === "running") {
      return res.status(400).json({
        success: false,
        message: "Trip is already running",
      });
    }

    if (
      trip.status === "completed" ||
      trip.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This trip cannot be started",
      });
    }

    const now = new Date();

    trip.status = "running";
    trip.startedAt = now;
    trip.liveTracking = true;

    await trip.save();

    // Mark bus as active
    await Bus.findByIdAndUpdate(
      trip.bus,
      {
        status: "active",
        liveTracking: true,
      }
    );

    // Notify passengers
    const io = req.app.get("io");

    if (io) {
      io.to(`trip:${id}`).emit(
        "trip-started",
        {
          tripId: id,
          status: "running",
          startedAt: now,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Trip started successfully",
      trip,
    });
  } catch (error) {
    console.error(
      "Start Trip Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start trip",
      error: error.message,
    });
  }
};

// =====================================================
// END TRIP
// PUT /api/trips/:id/end
// Allowed: driver, operator, admin
// =====================================================
const endTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (req.user.role === "operator") {
      const bus = await Bus.findById(trip.bus).select("operator");
      if (!bus || bus.operator.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "You can only manage your own trips" });
      }
    }

    // Driver ownership check
    if (
      req.user.role === "driver" &&
      trip.driver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this trip",
      });
    }

    if (trip.status !== "running") {
      return res.status(400).json({
        success: false,
        message:
          "Only running trips can be ended",
      });
    }

    const now = new Date();

    trip.status = "completed";
    trip.endedAt = now;
    trip.liveTracking = false;

    await trip.save();

    // Mark bus inactive
    await Bus.findByIdAndUpdate(
      trip.bus,
      {
        status: "inactive",
        liveTracking: false,
      }
    );

    // Notify passengers
    const io = req.app.get("io");

    if (io) {
      io.to(`trip:${id}`).emit(
        "trip-ended",
        {
          tripId: id,
          status: "completed",
          endedAt: now,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Trip ended successfully",
      trip,
    });
  } catch (error) {
    console.error(
      "End Trip Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to end trip",
      error: error.message,
    });
  }
};

// =====================================================
// CANCEL TRIP
// PUT /api/trips/:id/cancel
// Allowed: operator, admin
// =====================================================
const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (req.user.role === "operator") {
      const bus = await Bus.findById(trip.bus).select("operator");
      if (!bus || bus.operator.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "You can only manage your own trips" });
      }
    }

    if (
      !["scheduled", "boarding"].includes(trip.status)
    ) {
      return res.status(400).json({
        success: false,
        message: "This trip cannot be cancelled now",
      });
    }

    trip.status = "cancelled";
    trip.liveTracking = false;

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Trip cancelled successfully",
      trip,
    });
  } catch (error) {
    console.error("Cancel Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel trip",
      error: error.message,
    });
  }
};

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  startTrip,
  endTrip,
  cancelTrip,
};
