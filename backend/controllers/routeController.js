const Route = require("../models/Route");
const Bus = require("../models/Bus");

// =====================================================
// CREATE ROUTE
// POST /api/routes
// Allowed: operator, admin
// =====================================================
const createRoute = async (req, res) => {
  try {
    const {
      routeName,
      routeNumber,
      origin,
      destination,
      distanceKm,
      estimatedDurationMinutes,
      fare,
      buses,
      stops,
      firstBusTime,
      lastBusTime,
    } = req.body;

    if (
      !routeName ||
      !routeNumber ||
      !origin ||
      !destination ||
      distanceKm === undefined ||
      estimatedDurationMinutes === undefined ||
      fare === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Route name, route number, origin, destination, distance, duration and fare are required",
      });
    }

    const existingRoute = await Route.findOne({
      routeNumber: routeNumber.trim(),
    });

    if (existingRoute) {
      return res.status(409).json({
        success: false,
        message: "Route with this route number already exists",
      });
    }

    // If buses are supplied, verify they exist
    if (buses && buses.length > 0) {
      const busCount = await Bus.countDocuments({
        _id: { $in: buses },
      });

      if (busCount !== buses.length) {
        return res.status(400).json({
          success: false,
          message: "One or more buses are invalid",
        });
      }
    }

    const route = await Route.create({
      routeName: routeName.trim(),
      routeNumber: routeNumber.trim(),
      origin: origin.trim(),
      destination: destination.trim(),
      distanceKm,
      estimatedDurationMinutes,
      fare,
      operator: req.user.id,
      buses: buses || [],
      stops: stops || [],
      firstBusTime: firstBusTime || "",
      lastBusTime: lastBusTime || "",
      isApproved: req.user.role === "admin",
    });

    const populatedRoute = await Route.findById(route._id)
      .populate(
        "operator",
        "name email phone"
      )
      .populate(
        "buses",
        "busNumber registrationNumber busType status liveTracking"
      )
      .populate(
        "stops",
        "name city address location sequence estimatedArrivalMinutes"
      );

    return res.status(201).json({
      success: true,
      message: "Route created successfully",
      route: populatedRoute,
    });
  } catch (error) {
    console.error("Create Route Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create route",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL ROUTES
// GET /api/routes
// Public
// =====================================================
const getRoutes = async (req, res) => {
  try {
    const {
      origin,
      destination,
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (origin) {
      filter.origin = {
        $regex: origin,
        $options: "i",
      };
    }

    if (destination) {
      filter.destination = {
        $regex: destination,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          routeName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          routeNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          origin: {
            $regex: search,
            $options: "i",
          },
        },
        {
          destination: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    const routes = await Route.find(filter)
      .populate(
        "operator",
        "name email phone"
      )
      .populate(
        "buses",
        "busNumber busType status liveTracking"
      )
      .populate(
        "stops",
        "name city location sequence"
      )
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const total = await Route.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: routes.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      routes,
    });
  } catch (error) {
    console.error("Get Routes Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE ROUTE
// GET /api/routes/:id
// Public
// =====================================================
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate(
        "operator",
        "name email phone"
      )
      .populate(
        "buses",
        "busNumber registrationNumber busType status liveTracking currentLocation"
      )
      .populate(
        "stops",
        "name city address location sequence estimatedArrivalMinutes"
      );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // Keep stops in correct sequence
    if (route.stops) {
      route.stops.sort(
        (a, b) => a.sequence - b.sequence
      );
    }

    return res.status(200).json({
      success: true,
      route,
    });
  } catch (error) {
    console.error("Get Route Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE ROUTE
// PUT /api/routes/:id
// Allowed: operator, admin
// =====================================================
const updateRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    // Operator can update only their own routes
    if (
      req.user.role === "operator" &&
      route.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only manage your own routes",
      });
    }

    const allowedFields = [
      "routeName",
      "routeNumber",
      "origin",
      "destination",
      "distanceKm",
      "estimatedDurationMinutes",
      "fare",
      "buses",
      "stops",
      "firstBusTime",
      "lastBusTime",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        route[field] = req.body[field];
      }
    });

    await route.save();

    const updatedRoute = await Route.findById(route._id)
      .populate(
        "operator",
        "name email phone"
      )
      .populate(
        "buses",
        "busNumber registrationNumber busType status liveTracking"
      )
      .populate(
        "stops",
        "name city address location sequence"
      );

    return res.status(200).json({
      success: true,
      message: "Route updated successfully",
      route: updatedRoute,
    });
  } catch (error) {
    console.error("Update Route Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update route",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE ROUTE
// DELETE /api/routes/:id
// Allowed: operator, admin
// =====================================================
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found",
      });
    }

    if (
      req.user.role === "operator" &&
      route.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only manage your own routes",
      });
    }

    await route.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Route deleted successfully",
    });
  } catch (error) {
    console.error("Delete Route Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete route",
      error: error.message,
    });
  }
};

module.exports = {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
};