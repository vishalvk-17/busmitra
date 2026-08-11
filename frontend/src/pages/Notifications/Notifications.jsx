import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import notificationService from "../../services/notificationService";
import liveTrackingService from "../../services/liveTrackingService";

import "./Notifications.css";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [removingId, setRemovingId] =
    useState(null);

  const [socketConnected, setSocketConnected] =
    useState(false);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await notificationService.getNotifications();

        setNotifications(
          data.notifications || []
        );

        setUnreadCount(
          data.unreadCount || 0
        );
      } catch (err) {
        console.error(
          "Notifications Error:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load notifications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    let socket;

    try {
      socket =
        liveTrackingService.createSocket();

      socket.on(
        "connect",
        () => {
          setSocketConnected(true);

          const user =
            JSON.parse(
              localStorage.getItem(
                "user"
              ) || "null"
            );

          const userId =
            user?._id ||
            user?.id;

          if (userId) {
            socket.emit(
              "join-user",
              userId
            );
          }
        }
      );

      socket.on(
        "disconnect",
        () => {
          setSocketConnected(false);
        }
      );

      socket.on(
        "notification-created",
        (notification) => {
          if (!notification?._id) {
            return;
          }

          setNotifications(
            (current) => [
              notification,
              ...current,
            ]
          );

          setUnreadCount(
            (current) =>
              current + 1
          );
        }
      );
    } catch (err) {
      console.error(
        "Notification socket error:",
        err
      );
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const handleMarkRead = async (
    notification
  ) => {
    if (
      notification.isRead
    ) {
      return;
    }

    try {
      await notificationService.markAsRead(
        notification._id
      );

      setNotifications(
        (current) =>
          current.map(
            (item) =>
              item._id ===
              notification._id
                ? {
                    ...item,
                    isRead: true,
                    readAt:
                      new Date(),
                  }
                : item
          )
      );

      setUnreadCount(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );
    } catch (err) {
      console.error(
        "Mark Read Error:",
        err
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const handleMarkAllRead =
    async () => {
      if (unreadCount === 0) {
        return;
      }

      try {
        await notificationService.markAllAsRead();

        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                isRead: true,
                readAt:
                  item.readAt ||
                  new Date(),
              })
            )
        );

        setUnreadCount(0);
      } catch (err) {
        console.error(
          "Mark All Read Error:",
          err
        );
      }
    };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (
    notificationId
  ) => {
    try {
      setRemovingId(
        notificationId
      );

      const target =
        notifications.find(
          (item) =>
            item._id ===
            notificationId
        );

      await notificationService.deleteNotification(
        notificationId
      );

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item._id !==
              notificationId
          )
      );

      if (
        target &&
        !target.isRead
      ) {
        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }
    } catch (err) {
      console.error(
        "Delete Notification Error:",
        err
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // NOTIFICATION CLICK
  // =====================================================

  const handleNotificationClick =
    async (notification) => {
      await handleMarkRead(
        notification
      );

      if (
        notification.trip?._id
      ) {
        navigate(
          `/track-bus?trip=${notification.trip._id}`
        );

        return;
      }

      if (
        notification.bus?._id
      ) {
        navigate(
          `/bus/${notification.bus._id}`
        );

        return;
      }

      if (
        notification.route?._id
      ) {
        navigate(
          `/route/${notification.route._id}`
        );
      }
    };

  // =====================================================
  // ICON
  // =====================================================

  const getNotificationIcon =
    (type) => {
      switch (type) {
        case "trip_started":
          return "🚌";

        case "trip_ended":
          return "🏁";

        case "bus_approaching":
          return "📍";

        case "route_update":
          return "🛣️";

        case "favorite_update":
          return "⭐";

        case "alert":
          return "⚠️";

        default:
          return "🔔";
      }
    };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const created =
      new Date(date);

    const now =
      new Date();

    const diff =
      now.getTime() -
      created.getTime();

    const minutes = Math.floor(
      diff / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return created.toLocaleDateString();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="notifications-page">

        <div className="notifications-container">

          <div className="notifications-loading">

            <div className="loading-spinner"></div>

            <h2>
              Loading notifications...
            </h2>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="notifications-page">

        <div className="notifications-container">

          <div className="notifications-error">

            <h2>
              Unable to load notifications
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="notifications-page">

      <div className="notifications-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notifications-header">

          <div>

            <span className="notifications-label">
              Bus Mitra
            </span>

            <h1>
              Notifications
            </h1>

            <p>
              Stay updated about your
              buses and trips.
            </p>

          </div>

          <div className="notifications-header-actions">

            {unreadCount > 0 && (
              <span className="unread-count">
                {unreadCount} unread
              </span>
            )}

            <span
              className={`socket-indicator ${
                socketConnected
                  ? "online"
                  : "offline"
              }`}
            >
              ●{" "}
              {socketConnected
                ? "Live"
                : "Offline"}
            </span>

          </div>

        </div>


        {/* =================================================
            TOOLBAR
        ================================================= */}

        {notifications.length >
          0 && (

          <div className="notifications-toolbar">

            <span>
              {notifications.length}{" "}
              notification
              {notifications.length !==
              1
                ? "s"
                : ""}
            </span>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllRead
                }
              >
                Mark all as read
              </button>
            )}

          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {notifications.length ===
          0 && (

          <div className="notifications-empty">

            <div className="notifications-empty-icon">
              🔔
            </div>

            <h2>
              No notifications
            </h2>

            <p>
              You're all caught up.
              We'll notify you when
              something important happens.
            </p>

          </div>
        )}


        {/* =================================================
            LIST
        ================================================= */}

        {notifications.length >
          0 && (

          <div className="notifications-list">

            {notifications.map(
              (notification) => (

                <div
                  key={
                    notification._id
                  }
                  className={`notification-card ${
                    notification.isRead
                      ? "read"
                      : "unread"
                  }`}
                >

                  {/* ICON */}

                  <button
                    type="button"
                    className="notification-main"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                  >

                    <div className="notification-icon">

                      {getNotificationIcon(
                        notification.type
                      )}

                    </div>


                    <div className="notification-content">

                      <div className="notification-title-row">

                        <h3>
                          {
                            notification.title
                          }
                        </h3>

                        {!notification.isRead && (
                          <span className="unread-dot"></span>
                        )}

                      </div>

                      <p>
                        {
                          notification.message
                        }
                      </p>

                      <small>
                        {formatTime(
                          notification.createdAt
                        )}
                      </small>

                    </div>

                  </button>


                  {/* DELETE */}

                  <button
                    type="button"
                    className="notification-delete"
                    disabled={
                      removingId ===
                      notification._id
                    }
                    onClick={() =>
                      handleDelete(
                        notification._id
                      )
                    }
                    aria-label="Delete notification"
                  >
                    ×
                  </button>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Notifications;