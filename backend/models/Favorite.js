const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["bus", "route"],
      required: true,
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
  },
  {
    timestamps: true,
  }
);

/*
 * Prevent duplicate favorites.
 */
favoriteSchema.index(
  {
    user: 1,
    type: 1,
    bus: 1,
    route: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Favorite",
  favoriteSchema
);