const mongoose = require("mongoose");

const liveLocationSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
      index: true,
    },

    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: true,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      latitude: {
        type: Number,
        required: true,
      },

      longitude: {
        type: Number,
        required: true,
      },
    },

    speed: {
      type: Number,
      default: 0,
      min: 0,
    },

    heading: {
      type: Number,
      default: 0,
      min: 0,
      max: 360,
    },

    accuracy: {
      type: Number,
      default: null,
      min: 0,
    },

    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LiveLocation",
  liveLocationSchema
);