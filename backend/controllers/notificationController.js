const Notification =
  require("../models/Notification");

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          user: req.user.id,
        })
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
          )
          .sort({
            createdAt: -1,
          })
          .limit(100);

      const unreadCount =
        await Notification.countDocuments({
          user: req.user.id,
          isRead: false,
        });

      return res.status(200).json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error) {
      console.error(
        "Get Notifications Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch notifications",
      });
    }
  };


// =====================================================
// MARK ONE AS READ
// =====================================================

const markAsRead =
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification =
        await Notification.findOne({
          _id: id,
          user: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      notification.isRead = true;
      notification.readAt =
        new Date();

      await notification.save();

      return res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notification",
      });
    }
  };


// =====================================================
// MARK ALL AS READ
// =====================================================

const markAllAsRead =
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user.id,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
      });
    }
  };


// =====================================================
// DELETE NOTIFICATION
// =====================================================

const deleteNotification =
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification =
        await Notification.findOneAndDelete({
          _id: id,
          user: req.user.id,
        });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Notification deleted",
      });
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete notification",
      });
    }
  };


module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};