const Stop = require("../models/Stop");

// =====================================================
// CREATE STOP
// POST /api/stops
// Allowed: operator, admin
// =====================================================
const createStop = async (req, res) => {
  try {
    const {
      name,
      city,
      address,
      latitude,
      longitude,
      sequence,
      estimatedArrivalMinutes,
    } = req.body;

    if (
      !name ||
      !city ||
      latitude === undefined ||
      longitude === undefined ||
      sequence === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, city, latitude, longitude and sequence are required",
      });
    }

    const stop = await Stop.create({
      name: name.trim(),
      city: city.trim(),
      address: address?.trim() || "",
      location: {
        latitude,
        longitude,
      },
      sequence,
      estimatedArrivalMinutes:
        estimatedArrivalMinutes || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Stop created successfully",
      stop,
    });
  } catch (error) {
    console.error("Create Stop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create stop",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL STOPS
// GET /api/stops
// Public
// =====================================================
const getStops = async (req, res) => {
  try {
    const {
      city,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i",
      };
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          city: {
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

    const stops = await Stop.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .sort({
        city: 1,
        sequence: 1,
      });

    const total = await Stop.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: stops.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      stops,
    });
  } catch (error) {
    console.error("Get Stops Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stops",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE STOP
// GET /api/stops/:id
// Public
// =====================================================
const getStopById = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    return res.status(200).json({
      success: true,
      stop,
    });
  } catch (error) {
    console.error("Get Stop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stop",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE STOP
// PUT /api/stops/:id
// Allowed: operator, admin
// =====================================================
const updateStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    const allowedFields = [
      "name",
      "city",
      "address",
      "sequence",
      "estimatedArrivalMinutes",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        stop[field] = req.body[field];
      }
    });

    if (
      req.body.latitude !== undefined ||
      req.body.longitude !== undefined
    ) {
      stop.location.latitude =
        req.body.latitude !== undefined
          ? req.body.latitude
          : stop.location.latitude;

      stop.location.longitude =
        req.body.longitude !== undefined
          ? req.body.longitude
          : stop.location.longitude;
    }

    await stop.save();

    return res.status(200).json({
      success: true,
      message: "Stop updated successfully",
      stop,
    });
  } catch (error) {
    console.error("Update Stop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update stop",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE STOP
// DELETE /api/stops/:id
// Allowed: operator, admin
// =====================================================
const deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findById(req.params.id);

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found",
      });
    }

    // Soft delete
    stop.isActive = false;

    await stop.save();

    return res.status(200).json({
      success: true,
      message: "Stop removed successfully",
    });
  } catch (error) {
    console.error("Delete Stop Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete stop",
      error: error.message,
    });
  }
};

module.exports = {
  createStop,
  getStops,
  getStopById,
  updateStop,
  deleteStop,
};