const Route = require("../models/Route");
const Trip = require("../models/Trip");

// =====================================================
// SEARCH BUSES
// GET /api/search/buses
// Public
// =====================================================
const searchBuses = async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      page = 1,
      limit = 10,
    } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: "Origin and destination are required",
      });
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip = (pageNumber - 1) * limitNumber;

    // Find matching routes
    const routeFilter = {
      origin: {
        $regex: origin.trim(),
        $options: "i",
      },
      destination: {
        $regex: destination.trim(),
        $options: "i",
      },
      status: "active",
    };

    const routes = await Route.find(routeFilter)
      .populate(
        "buses",
        "busNumber registrationNumber busType totalSeats availableSeats status liveTracking currentLocation"
      )
      .populate(
        "stops",
        "name city address location sequence estimatedArrivalMinutes"
      )
      .populate(
        "operator",
        "name phone email"
      )
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    const totalRoutes =
      await Route.countDocuments(routeFilter);

    if (routes.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No buses found for this route",
        search: {
          origin,
          destination,
          date: date || null,
        },
        count: 0,
        total: 0,
        routes: [],
        buses: [],
        trips: [],
      });
    }

    // Get route IDs
    const routeIds = routes.map(
      (route) => route._id
    );

    // Find trips for matching routes
    const tripFilter = {
      route: {
        $in: routeIds,
      },
      status: {
        $in: [
          "scheduled",
          "boarding",
          "running",
        ],
      },
    };

    // If date supplied, filter trips for that date
    if (date) {
      const startDate = new Date(date);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setDate(
        endDate.getDate() + 1
      );

      tripFilter.tripDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const trips = await Trip.find(tripFilter)
      .populate(
        "bus",
        "busNumber registrationNumber busType totalSeats availableSeats status liveTracking currentLocation"
      )
      .populate(
        "driver",
        "name profileImage"
      )
      .populate(
        "route",
        "routeName routeNumber origin destination distanceKm estimatedDurationMinutes fare firstBusTime lastBusTime"
      )
      .populate(
        "currentStop",
        "name city sequence"
      )
      .populate(
        "nextStop",
        "name city sequence"
      )
      .sort({
        scheduledStartTime: 1,
      });

    // Unique buses from routes
    const busMap = new Map();

    routes.forEach((route) => {
      route.buses.forEach((bus) => {
        busMap.set(
          bus._id.toString(),
          bus
        );
      });
    });

    return res.status(200).json({
      success: true,

      search: {
        origin,
        destination,
        date: date || null,
      },

      count: trips.length,

      totalRoutes,

      routes,

      buses: Array.from(
        busMap.values()
      ),

      trips,
    });
  } catch (error) {
    console.error(
      "Search Buses Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to search buses",
      error: error.message,
    });
  }
};

module.exports = {
  searchBuses,
};