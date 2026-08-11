const Bus = require("../models/Bus");

// =====================================================
// CREATE BUS
// POST /api/buses
// Allowed: operator, admin
// =====================================================
const createBus = async (req, res) => {
  try {
    const {
      busNumber,
      registrationNumber,
      driver,
      busType,
      totalSeats,
      availableSeats,
      amenities,
    } = req.body;

    if (!busNumber || !registrationNumber || !totalSeats) {
      return res.status(400).json({
        success: false,
        message:
          "Bus number, registration number and total seats are required",
      });
    }

    const existingBus = await Bus.findOne({
      $or: [
        { busNumber },
        {
          registrationNumber: registrationNumber.toUpperCase(),
        },
      ],
    });

    if (existingBus) {
      return res.status(409).json({
        success: false,
        message: "Bus with this number or registration already exists",
      });
    }

    const bus = await Bus.create({
      busNumber: busNumber.trim(),

      registrationNumber: registrationNumber
        .trim()
        .toUpperCase(),

      operator: req.user.id,

      driver: driver || null,

      busType: busType || "ordinary",

      totalSeats,

      availableSeats:
        availableSeats !== undefined
          ? availableSeats
          : totalSeats,

      amenities: amenities || [],

      status: "inactive",

      liveTracking: false,

      isApproved: req.user.role === "admin",
    });

    const populatedBus = await Bus.findById(bus._id)
      .populate("operator", "name email phone")
      .populate("driver", "name phone");

    return res.status(201).json({
      success: true,
      message: "Bus created successfully",
      bus: populatedBus,
    });
  } catch (error) {
    console.error("Create Bus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create bus",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL BUSES
// GET /api/buses
// Public
// =====================================================
const getBuses = async (req, res) => {
  try {
    const {
      status,
      busType,
      search,
      operator,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (busType) {
      filter.busType = busType;
    }

    if (operator) {
      filter.operator = operator;
    }

    if (search) {
      filter.$or = [
        {
          busNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          registrationNumber: {
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

    const buses = await Bus.find(filter)
      .populate("driver", "name phone profileImage")
      .populate("operator", "name email phone")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const total = await Bus.countDocuments(filter);

    return res.status(200).json({
      success: true,
      count: buses.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      buses,
    });
  } catch (error) {
    console.error("Get Buses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch buses",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE BUS
// GET /api/buses/:id
// Public
// =====================================================
const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id)
      .populate(
        "driver",
        "name phone profileImage isVerified"
      )
      .populate(
        "operator",
        "name email phone profileImage"
      );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    return res.status(200).json({
      success: true,
      bus,
    });
  } catch (error) {
    console.error("Get Bus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE BUS
// PUT /api/buses/:id
// Allowed: operator, admin
// =====================================================
const updateBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Operator can update only their own bus
    if (
      req.user.role === "operator" &&
      bus.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own buses",
      });
    }

    const allowedFields = [
      "busNumber",
      "registrationNumber",
      "driver",
      "busType",
      "totalSeats",
      "availableSeats",
      "status",
      "amenities",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        bus[field] = req.body[field];
      }
    });

    if (bus.registrationNumber) {
      bus.registrationNumber = bus.registrationNumber
        .trim()
        .toUpperCase();
    }

    await bus.save();

    const updatedBus = await Bus.findById(bus._id)
      .populate("driver", "name phone profileImage")
      .populate("operator", "name email phone");

    return res.status(200).json({
      success: true,
      message: "Bus updated successfully",
      bus: updatedBus,
    });
  } catch (error) {
    console.error("Update Bus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update bus",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE BUS
// DELETE /api/buses/:id
// Allowed: operator, admin
// =====================================================
const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    // Operator can delete only their own bus
    if (
      req.user.role === "operator" &&
      bus.operator.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage your own buses",
      });
    }

    // Prevent deletion while bus is actively tracking
    if (bus.liveTracking) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a bus while live tracking is active",
      });
    }

    await bus.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    console.error("Delete Bus Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete bus",
      error: error.message,
    });
  }
};

module.exports = {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
};