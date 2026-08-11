const mongoose = require("mongoose");

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    busType: {
      type: String,
      enum: [
        "ordinary",
        "express",
        "ac",
        "sleeper",
        "semi-sleeper",
        "electric",
      ],
      default: "ordinary",
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "maintenance",
        "offline",
      ],
      default: "inactive",
    },

    liveTracking: {
      type: Boolean,
      default: false,
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

    amenities: [
      {
        type: String,
        enum: [
          "ac",
          "wifi",
          "charging",
          "gps",
          "cctv",
          "first-aid",
        ],
      },
    ],

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bus", busSchema);