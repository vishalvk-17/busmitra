const mongoose = require("mongoose");

const notificationSchema =
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: [
          "trip_started",
          "trip_ended",
          "bus_approaching",
          "route_update",
          "favorite_update",
          "system",
          "alert",
        ],
        default: "system",
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      message: {
        type: String,
        required: true,
        trim: true,
      },

      trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trip",
        default: null,
      },

      bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        default: null,
      },

      route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        default: null,
      },

      isRead: {
        type: Boolean,
        default: false,
      },

      readAt: {
        type: Date,
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );

notificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports =
  mongoose.model(
    "Notification",
    notificationSchema
  );