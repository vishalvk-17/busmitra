const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },

    tripDate: {
      type: Date,
      required: true,
    },

    scheduledStartTime: {
      type: Date,
      required: true,
    },

    actualStartTime: {
      type: Date,
      default: null,
    },

    scheduledEndTime: {
      type: Date,
      default: null,
    },

    actualEndTime: {
      type: Date,
      default: null,
    },

    currentStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null,
    },

    nextStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "scheduled",
        "boarding",
        "running",
        "paused",
        "completed",
        "cancelled",
      ],
      default: "scheduled",
    },

    liveTracking: {
      type: Boolean,
      default: false,
    },

    currentSpeed: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },

    distanceCoveredKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    remainingDistanceKm: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedArrivalTime: {
      type: Date,
      default: null,
    },

    delayMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    passengerCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);