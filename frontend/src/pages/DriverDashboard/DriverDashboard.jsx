import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBus,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardList,
  FaExclamationTriangle,
  FaHome,
  FaLocationArrow,
  FaMap,
  FaMapMarkerAlt,
  FaPhone,
  FaPlay,
  FaPowerOff,
  FaRoute,
  FaUser,
} from "react-icons/fa";
import api from "../../services/api";
import authService from "../../services/authService";
import "./DriverDashboard.css";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const watchId = useRef(null);

  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [notifications, setNotifications] = useState(3);

  const loadTrips = async () => {
    try {
      const { data } = await api.get("/drivers/trips");

      const receivedTrips = data.trips || [];
      setTrips(receivedTrips);

      const active =
        receivedTrips.find((trip) => trip.status === "running") ||
        receivedTrips.find((trip) => trip.status === "scheduled") ||
        receivedTrips[0];

      if (active) {
        setSelectedTrip((current) => current || active._id);
      }
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) {
        navigate("/driver/login");
      } else {
        setError(
          err.response?.data?.message || "Unable to load your trips."
        );
      }
    }
  };

  useEffect(() => {
    loadTrips();

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation?.clearWatch(watchId.current);
      }
    };
  }, []);

  const stopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation?.clearWatch(watchId.current);
    }

    watchId.current = null;
    setSharing(false);
  };

  const sendLocation = async (position) => {
    if (!selectedTrip) return;

    await api.post(`/live-location/${selectedTrip}`, {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: Math.max(
        0,
        Math.round((position.coords.speed || 0) * 3.6)
      ),
      heading: position.coords.heading || 0,
      accuracy: position.coords.accuracy || null,
    });

    setMessage(
      `Live location shared at ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    );
  };

  const startSharing = async () => {
    setError("");
    setMessage("");

    if (!selectedTrip) {
      setError("Select a trip before sharing location.");
      return;
    }

    if (!navigator.geolocation) {
      setError("This device does not support location sharing.");
      return;
    }

    const trip = trips.find((item) => item._id === selectedTrip);

    try {
      if (trip?.status === "scheduled") {
        await api.put(`/trips/${selectedTrip}/start`);
      }

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          sendLocation(position).catch((err) =>
            setError(
              err.response?.data?.message ||
                "Location could not be sent."
            )
          );
        },
        (geoError) =>
          setError(
            geoError.message ||
              "Location permission is required."
          ),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );

      setSharing(true);
      await loadTrips();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to start this trip."
      );
    }
  };

  const endTrip = async () => {
    try {
      stopSharing();

      await api.put(`/trips/${selectedTrip}/end`);

      setMessage(
        "Trip ended and location sharing stopped."
      );

      await loadTrips();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to end trip."
      );
    }
  };

  const logout = () => {
    stopSharing();
    authService.logout();
    navigate("/driver/login");
  };

  const selected = trips.find(
    (trip) => trip._id === selectedTrip
  );

  const driverName =
    selected?.driver?.name ||
    selected?.driverName ||
    "Ramesh";

  const busNumber =
    selected?.bus?.busNumber || "MP 04 PA 1234";

  const busType =
    selected?.bus?.model ||
    selected?.bus?.busType ||
    "Bharat Benz 34 Seater";

  const origin =
    selected?.route?.origin || "Bhopal";

  const destination =
    selected?.route?.destination || "Indore";

  const departureTime = selected?.scheduledStartTime
    ? new Date(selected.scheduledStartTime).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )
    : "06:30 AM";

  const arrivalTime = "11:00 AM";

  return (
    <main className="driver-dashboard">
      {/* =====================================
          HEADER
      ===================================== */}

      <header className="dashboard-header">
        <div className="dashboard-status-bar">
          <span>9:41</span>

          <div className="phone-status">
            <span className="signal">▮▮▮</span>
            <span className="wifi">⌁</span>
            <span className="battery">100%</span>
          </div>
        </div>

        <div className="header-main">
          <button
            className="menu-button"
            type="button"
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="driver-greeting">
            <h1>
              Good Morning, {driverName} 👋
            </h1>

            <p>Welcome back to Bus Mitra Driver</p>
          </div>

          <button
            className="notification-button"
            type="button"
            onClick={() => {
              setNotifications(0);
              navigate("/driver/notifications");
            }}
          >
            <FaBell />

            {notifications > 0 && (
              <span className="notification-count">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* =====================================
          MAIN
      ===================================== */}

      <section className="dashboard-content">

        {/* DUTY CARD */}

        <section className="duty-card">
          <div className="duty-left">
            <div className="duty-shield">
              <FaCheckCircle />
            </div>

            <div>
              <h2>
                {sharing
                  ? "You are On Duty"
                  : "You are Off Duty"}
              </h2>

              <p>
                {sharing
                  ? "Your location is live"
                  : "Start your trip to go live"}
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`duty-toggle ${
              sharing ? "active" : ""
            }`}
            onClick={() => {
              if (sharing) {
                stopSharing();
              } else {
                startSharing();
              }
            }}
            aria-label="Toggle duty status"
          >
            <span></span>
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* =====================================
            TODAY OVERVIEW
        ===================================== */}

        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Today's Overview</h2>

            <div className="date-display">
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  weekday: "long",
                })}
              </span>

              <FaCalendarAlt />
            </div>
          </div>

          <div className="overview-card">

            <div className="assigned-bus">
              <div className="bus-icon-box">
                <FaBus />
              </div>

              <div>
                <span>Assigned Bus</span>

                <strong>{busNumber}</strong>

                <p>{busType}</p>
              </div>
            </div>

            <div className="overview-divider"></div>

            <div className="bus-condition">

              <div className="condition-row">
                <span>Bus Status</span>

                <strong>
                  Good
                  <FaCheckCircle />
                </strong>
              </div>

              <div className="condition-row fuel-row">
                <span>Fuel Level</span>

                <strong>
                  <span className="fuel-icon">⛽</span>
                  72%
                </strong>
              </div>

              <div className="fuel-progress">
                <span style={{ width: "72%" }}></span>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================
            TODAY ROUTE
        ===================================== */}

        <section className="route-card">

          <div className="route-information">

            <span className="small-heading">
              Today's Route
            </span>

            <h2>
              {origin}
              <span>→</span>
              {destination}
            </h2>

            <div className="route-stops">

              <div className="route-stop">
                <FaMapMarkerAlt />

                <span>
                  {origin} Bus Stand
                </span>
              </div>

              <div className="route-dotted-line"></div>

              <div className="route-stop">
                <FaMapMarkerAlt />

                <span>
                  {destination} Rajwada Bus Stand
                </span>
              </div>

            </div>

            <div className="route-stats">

              <div>
                <div className="stat-icon blue">
                  <FaRoute />
                </div>

                <span>Distance</span>
                <strong>195 km</strong>
              </div>

              <div>
                <div className="stat-icon green">
                  <span>◷</span>
                </div>

                <span>Duration</span>
                <strong>4h 30m</strong>
              </div>

            </div>
          </div>

          {/* Map preview */}

          <div className="route-map">

            <div className="map-grid"></div>

            <span className="map-road road-1"></span>
            <span className="map-road road-2"></span>
            <span className="map-road road-3"></span>

            <div className="map-route-line"></div>

            <div className="map-start">
              <span></span>
              <strong>{origin}</strong>
            </div>

            <div className="map-end">
              <FaMapMarkerAlt />
              <strong>{destination}</strong>
            </div>

            <button
              className="map-expand"
              type="button"
            >
              ↗
            </button>
          </div>
        </section>

        {/* =====================================
            SCHEDULE
        ===================================== */}

        <section className="dashboard-section schedule-section">

          <div className="section-heading">
            <h2>Today's Schedule</h2>

            <button
              type="button"
              onClick={() => navigate("/driver/trips")}
            >
              View All
            </button>
          </div>

          {selected ? (
            <div className="schedule-card">

              <div className="schedule-time departure">
                <strong>{departureTime}</strong>
                <span>Departure</span>
              </div>

              <div className="schedule-play">
                <FaPlay />
              </div>

              <div className="schedule-location">
                <strong>{origin} Bus Stand</strong>

                <span>
                  {sharing ? "Live • On Route" : "On Time"}
                </span>
              </div>

              <div className="schedule-arrow">
                → 
              </div>

              <div className="schedule-time arrival">
                <strong>{arrivalTime}</strong>
                <span>Est. Arrival</span>
              </div>

              <button className="schedule-more">
                ⋮
              </button>

            </div>
          ) : (
            <div className="empty-schedule">
              No scheduled trips available.
            </div>
          )}
        </section>

        {/* =====================================
            QUICK ACTIONS
        ===================================== */}

        <section className="dashboard-section quick-section">

          <div className="section-heading">
            <h2>Quick Actions</h2>
          </div>

          <div className="quick-actions">

            <button
              className="quick-action start"
              onClick={startSharing}
              type="button"
            >
              <div className="quick-icon">
                <FaPlay />
              </div>

              <strong>Start Duty</strong>

              <span>
                Go Live & Start Trip
              </span>
            </button>

            <button
              className="quick-action end"
              onClick={endTrip}
              type="button"
            >
              <div className="quick-icon">
                <span></span>
              </div>

              <strong>End Duty</strong>

              <span>
                End Trip & Go Offline
              </span>
            </button>

            <button
              className="quick-action stops"
              type="button"
              onClick={() => navigate("/driver/routes")}
            >
              <div className="quick-icon">
                <FaMapMarkerAlt />
              </div>

              <strong>Stops</strong>

              <span>
                View Route Stops
              </span>
            </button>

            <button
              className="quick-action issue"
              type="button"
            >
              <div className="quick-icon">
                <FaBell />
              </div>

              <strong>Report Issue</strong>

              <span>
                Report a Problem
              </span>
            </button>

          </div>
        </section>

        {/* =====================================
            EMERGENCY
        ===================================== */}

        <section className="emergency-card">

          <div className="emergency-icon">
            <FaExclamationTriangle />
          </div>

          <div className="emergency-text">
            <strong>Emergency</strong>

            <span>
              Need help? Contact support immediately.
            </span>
          </div>

          <a
            href="tel:18001234567"
            className="sos-button"
          >
            <FaPhone />
            <span>SOS</span>
          </a>

        </section>
      </section>

      {/* =====================================
          BOTTOM NAVIGATION
      ===================================== */}

      <nav className="driver-bottom-nav">

        <button
          className="nav-item active"
          onClick={() => navigate("/driver/dashboard")}
        >
          <FaHome />
          <span>Dashboard</span>
        </button>

        <button
          className="nav-item"
          onClick={() => navigate("/driver/routes")}
        >
          <FaMap />
          <span>Route</span>
        </button>

        <button
          className="nav-item"
          onClick={() => navigate("/driver/trips")}
        >
          <FaClipboardList />
          <span>Trips</span>
        </button>

        <button
          className="nav-item notification-nav"
          onClick={() =>
            navigate("/driver/notifications")
          }
        >
          <FaBell />

          {notifications > 0 && (
            <span className="bottom-notification">
              {notifications}
            </span>
          )}

          <span>Notifications</span>
        </button>

        <button
          className="nav-item"
          onClick={() => navigate("/driver/profile")}
        >
          <FaUser />
          <span>Profile</span>
        </button>

      </nav>
    </main>
  );
}
