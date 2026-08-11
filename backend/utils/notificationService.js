const Notification =
  require("../models/Notification");

const createNotification =
  async ({
    userId,
    type = "system",
    title,
    message,
    tripId = null,
    busId = null,
    routeId = null,
    io = null,
  }) => {
    if (!userId) {
      throw new Error(
        "userId is required"
      );
    }

    const notification =
      await Notification.create({
        user: userId,
        type,
        title,
        message,
        trip: tripId,
        bus: busId,
        route: routeId,
      });

    const populatedNotification =
      await Notification.findById(
        notification._id
      )
        .populate(
          "bus",
          "busNumber registrationNumber"
        )
        .populate(
          "route",
          "routeName origin destination"
        )
        .populate(
          "trip",
          "status startedAt endedAt"
        );

    // Send real-time notification
    if (io) {
      io.to(
        `user:${userId}`
      ).emit(
        "notification-created",
        populatedNotification
      );
    }

    return populatedNotification;
  };

module.exports = {
  createNotification,
};