const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeName: {
      type: String,
      required: true,
      trim: true,
    },

    routeNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    origin: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDurationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },

    fare: {
      type: Number,
      required: true,
      min: 0,
    },

    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],

    stops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stop",
      },
    ],

    firstBusTime: {
      type: String,
      default: "",
    },

    lastBusTime: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Route", routeSchema);