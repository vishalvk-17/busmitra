const Favorite = require("../models/Favorite");

// =====================================================
// GET MY FAVORITES
// =====================================================

const getMyFavorites = async (
  req,
  res
) => {
  try {
    const favorites =
      await Favorite.find({
        user: req.user.id,
      })
        .populate(
          "bus",
          `
            busNumber
            registrationNumber
            busType
            status
            liveTracking
            currentLocation
          `
        )
        .populate(
          "route",
          `
            routeName
            routeNumber
            origin
            destination
            distanceKm
            estimatedDurationMinutes
            fare
            firstBusTime
            lastBusTime
          `
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error(
      "Get Favorites Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch favorites",
    });
  }
};


// =====================================================
// ADD FAVORITE
// =====================================================

const addFavorite = async (
  req,
  res
) => {
  try {
    const {
      type,
      busId,
      routeId,
    } = req.body;

    if (
      type !== "bus" &&
      type !== "route"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Favorite type must be bus or route",
      });
    }

    if (
      type === "bus" &&
      !busId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bus ID is required",
      });
    }

    if (
      type === "route" &&
      !routeId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Route ID is required",
      });
    }

    const existing =
      await Favorite.findOne({
        user: req.user.id,
        type,
        ...(type === "bus"
          ? { bus: busId }
          : { route: routeId }),
      });

    if (existing) {
      return res.status(200).json({
        success: true,
        message:
          "Already added to favorites",
        favorite: existing,
      });
    }

    const favorite =
      await Favorite.create({
        user: req.user.id,
        type,
        bus:
          type === "bus"
            ? busId
            : null,
        route:
          type === "route"
            ? routeId
            : null,
      });

    const populatedFavorite =
      await Favorite.findById(
        favorite._id
      )
        .populate(
          "bus",
          "busNumber registrationNumber busType status liveTracking"
        )
        .populate(
          "route",
          "routeName routeNumber origin destination distanceKm fare"
        );

    return res.status(201).json({
      success: true,
      message:
        "Added to favorites",
      favorite:
        populatedFavorite,
    });
  } catch (error) {
    console.error(
      "Add Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add favorite",
    });
  }
};


// =====================================================
// REMOVE FAVORITE
// =====================================================

const removeFavorite = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const favorite =
      await Favorite.findOneAndDelete({
        _id: id,
        user: req.user.id,
      });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message:
          "Favorite not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Removed from favorites",
    });
  } catch (error) {
    console.error(
      "Remove Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove favorite",
    });
  }
};


// =====================================================
// CHECK FAVORITE
// =====================================================

const checkFavorite = async (
  req,
  res
) => {
  try {
    const {
      type,
      id,
    } = req.params;

    const query = {
      user: req.user.id,
      type,
      ...(type === "bus"
        ? { bus: id }
        : { route: id }),
    };

    const favorite =
      await Favorite.findOne(query);

    return res.status(200).json({
      success: true,
      isFavorite:
        Boolean(favorite),
      favoriteId:
        favorite?._id || null,
    });
  } catch (error) {
    console.error(
      "Check Favorite Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to check favorite",
    });
  }
};


module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};
