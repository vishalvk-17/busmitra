const LiveLocation = require("../models/LiveLocation");
const Trip = require("../models/Trip");
const Bus = require("../models/Bus");

const updateLiveLocation = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
    } = req.body;

    const { tripId } = req.params;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Only assigned driver can update location
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
          "Live location can only be updated during an active trip",
      });
    }

    const recordedAt = new Date();

    // Save location history
    const liveLocation = await LiveLocation.create({
      trip: trip._id,
      bus: trip.bus,
      driver: trip.driver,
      location: {
        latitude,
        longitude,
      },
      speed: speed || 0,
      heading: heading || 0,
      accuracy: accuracy || null,
      recordedAt,
    });

    // Update current trip location
    trip.currentLocation = {
      latitude,
      longitude,
      updatedAt: recordedAt,
    };

    trip.currentSpeed = speed || 0;

    trip.liveTracking = true;

    await trip.save();

    // Update current bus location
    await Bus.findByIdAndUpdate(trip.bus, {
      liveTracking: true,
      status: "active",
      currentLocation: {
        latitude,
        longitude,
        updatedAt: recordedAt,
      },
    });

    // Broadcast live location
    const io = req.app.get("io");

    if (io) {
      io.to(`trip:${tripId}`).emit(
        "bus-location-updated",
        {
          tripId,
          busId: trip.bus,
          driverId: trip.driver,
          location: {
            latitude,
            longitude,
          },
          speed: speed || 0,
          heading: heading || 0,
          accuracy: accuracy || null,
          recordedAt,
        }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Location updated",
      location: liveLocation,
    });
  } catch (error) {
    console.error(
      "Live Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update live location",
      error: error.message,
    });
  }
};

const getLatestLocation = async (req, res) => {
  try {
    const { tripId } = req.params;

    const location =
      await LiveLocation.findOne({
        trip: tripId,
      }).sort({
        recordedAt: -1,
      });

    if (!location) {
      return res.status(404).json({
        success: false,
        message:
          "No live location available",
      });
    }

    return res.status(200).json({
      success: true,
      location,
    });
  } catch (error) {
    console.error(
      "Get Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch live location",
      error: error.message,
    });
  }
};

module.exports = {
  updateLiveLocation,
  getLatestLocation,
};