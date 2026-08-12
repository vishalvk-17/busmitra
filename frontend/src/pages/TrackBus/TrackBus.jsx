import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import {
  FaArrowLeft,
  FaBars,
  FaBell,
  FaBus,
  FaExclamationTriangle,
  FaList,
  FaRoute,
  FaShareAlt,
  FaSyncAlt,
  FaUserCircle,
} from "react-icons/fa";

import liveTrackingService from "../../services/liveTrackingService";
import tripService from "../../services/tripService";

import "leaflet/dist/leaflet.css";
import "./TrackBus.css";

// =====================================================
// BUS ICON
// =====================================================

const busIcon = L.divIcon({
  className: "bus-map-icon",

  html: `
    <div class="bus-marker">
      🚌
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

// =====================================================
// MAP CONTROLLER
// =====================================================

function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) {
      return;
    }

    map.setView(
      position,
      Math.max(map.getZoom(), 14),
      {
        animate: true,
      }
    );
  }, [position, map]);

  return null;
}

// =====================================================
// TRACK BUS
// =====================================================

function TrackBus() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const tripId =
    searchParams.get("trip");

  const [trip, setTrip] =
    useState(null);

  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [tripEnded, setTripEnded] =
    useState(false);

  // ===================================================
  // LOAD TRIP + SOCKET
  // ===================================================

  useEffect(() => {
    if (!tripId) {
      setLoading(false);

      setError(
        "No trip selected for tracking."
      );

      return;
    }

    let socket;

    const startTracking =
      async () => {
        try {
          setLoading(true);
          setError("");

          // -------------------------------------------
          // GET TRIP
          // -------------------------------------------

          const tripData =
            await tripService.getTripById(
              tripId
            );

          setTrip(
            tripData.trip
          );

          if (
            tripData.trip?.status ===
            "completed"
          ) {
            setTripEnded(true);
          }

          // -------------------------------------------
          // GET LATEST LOCATION
          // -------------------------------------------

          try {
            const locationData =
              await liveTrackingService.getLatestLocation(
                tripId
              );

            const latest =
              locationData.location;

            if (
              latest?.location
                ?.latitude &&
              latest?.location
                ?.longitude
            ) {
              setLocation({
                latitude:
                  latest.location
                    .latitude,

                longitude:
                  latest.location
                    .longitude,

                speed:
                  latest.speed || 0,

                heading:
                  latest.heading || 0,

                accuracy:
                  latest.accuracy,

                recordedAt:
                  latest.recordedAt,
              });
            }
          } catch {
            console.log(
              "No live location available."
            );
          }

          // -------------------------------------------
          // SOCKET
          // -------------------------------------------

          socket =
            liveTrackingService.createSocket();

          socket.on(
            "connect",
            () => {
              setSocketConnected(true);

              liveTrackingService.joinTrip(
                socket,
                tripId
              );
            }
          );

          socket.on(
            "disconnect",
            () => {
              setSocketConnected(false);
            }
          );

          // -------------------------------------------
          // LIVE LOCATION
          // -------------------------------------------

          socket.on(
            "bus-location-updated",
            (data) => {
              if (
                data.tripId !==
                tripId
              ) {
                return;
              }

              setLocation({
                latitude:
                  data.location
                    ?.latitude,

                longitude:
                  data.location
                    ?.longitude,

                speed:
                  data.speed || 0,

                heading:
                  data.heading || 0,

                accuracy:
                  data.accuracy,

                recordedAt:
                  data.recordedAt,
              });

              setTripEnded(false);

              setTrip((prev) =>
                prev
                  ? {
                      ...prev,
                      status:
                        "running",
                    }
                  : prev
              );
            }
          );

          // -------------------------------------------
          // TRIP STARTED
          // -------------------------------------------

          socket.on(
            "trip-started",
            (data) => {
              if (
                data.tripId !==
                tripId
              ) {
                return;
              }

              setTrip((prev) =>
                prev
                  ? {
                      ...prev,
                      status:
                        "running",
                      startedAt:
                        data.startedAt,
                    }
                  : prev
              );

              setTripEnded(false);
            }
          );

          // -------------------------------------------
          // TRIP ENDED
          // -------------------------------------------

          socket.on(
            "trip-ended",
            (data) => {
              if (
                data.tripId !==
                tripId
              ) {
                return;
              }

              setTrip((prev) =>
                prev
                  ? {
                      ...prev,
                      status:
                        "completed",
                      endedAt:
                        data.endedAt,
                    }
                  : prev
              );

              setTripEnded(true);
            }
          );
        } catch (err) {
          console.error(
            "Tracking Error:",
            err
          );

          setError(
            err.response?.data
              ?.message ||
              "Unable to load live tracking."
          );
        } finally {
          setLoading(false);
        }
      };

    startTracking();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [tripId]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="track-bus-page">

        <div className="tracking-loading">

          <div className="loading-spinner"></div>

          <h2>
            Loading live tracking...
          </h2>

          <p>
            Connecting to the bus.
          </p>

        </div>

      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <div className="track-bus-page">

        <div className="tracking-error">

          <h2>
            Tracking unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
          >
            Go Back
          </button>

        </div>

      </div>
    );
  }

  // ===================================================
  // MAP POSITION
  // ===================================================

  const mapPosition =
    location?.latitude &&
    location?.longitude
      ? [
          location.latitude,
          location.longitude,
        ]
      : null;

  // ===================================================
  // STOPS
  // ===================================================

  const stops =
    trip?.route?.stops
      ?.filter(
        (stop) =>
          stop.location?.latitude &&
          stop.location?.longitude
      )
      ?.sort(
        (a, b) =>
          a.sequence - b.sequence
      ) || [];

  const stopCoordinates =
    stops.map((stop) => [
      stop.location.latitude,
      stop.location.longitude,
    ]);

  // ===================================================
  // STATUS
  // ===================================================

  const isLive =
    trip?.status === "running" &&
    !tripEnded;

  const remainingDistance = trip?.remainingDistanceKm;
  const etaMinutes = remainingDistance !== undefined && remainingDistance !== null
    ? Math.max(1, Math.round((remainingDistance / Math.max(location?.speed || trip?.currentSpeed || 35, 15)) * 60))
    : null;

  return (
    <div className="track-bus-page">

      {/* ==============================================
          HEADER
      ============================================== */}

      <header className="tracking-topbar">
        <button type="button" className="tracking-menu-btn" aria-label="Open menu"><FaBars /></button>
        <div className="tracking-brand"><span><FaBus /></span><strong>Bus <em>Mitra</em></strong></div>
        <div className="tracking-top-actions">
          <button type="button"><FaShareAlt /><span>Share</span></button>
          <button type="button" onClick={() => window.location.reload()}><FaSyncAlt /><span>Refresh</span></button>
          <button type="button" aria-label="Notifications"><FaBell /></button>
          <FaUserCircle />
        </div>
      </header>

      <div className="tracking-header">

        <div>

          <span className="tracking-label">
            {isLive
              ? "Live Tracking"
              : "Trip Tracking"}
          </span>

          <h1>
            {trip?.bus?.busNumber ||
              "Bus"}
          </h1>

          <p>
            {trip?.route?.origin}
            {" → "}
            {trip?.route?.destination}
          </p>

        </div>


        {/* STATUS */}

        <div
          className={`tracking-status ${
            isLive
              ? "running"
              : "completed"
          }`}
        >

          <span></span>

          {isLive
            ? "LIVE"
            : "TRIP ENDED"}

        </div>

      </div>


      {/* ==============================================
          TRIP ENDED NOTICE
      ============================================== */}

      {tripEnded && (
        <div className="trip-ended-notice">

          <strong>
            Trip completed
          </strong>

          <p>
            This bus is no longer
            broadcasting live location.
          </p>

        </div>
      )}


      {/* ==============================================
          SOCKET STATUS
      ============================================== */}

      <div className="socket-status">

        <span
          className={
            socketConnected
              ? "connected"
              : "disconnected"
          }
        ></span>

        {socketConnected
          ? "Live connection active"
          : "Connecting to live server..."}

      </div>


      {/* ==============================================
          MAP
      ============================================== */}

      <div className="tracking-map">

        <div className="map-route-summary">
          <strong>{trip?.route?.origin || "Origin"} <span>→</span> {trip?.route?.destination || "Destination"}</strong>
          <div><b>{trip?.bus?.operator?.name || "Bus Mitra Travels"}</b><em className={isLive ? "live" : ""}>{isLive ? "Live" : "Trip Ended"}</em></div>
        </div>

        {mapPosition && !tripEnded && (
          <div className="map-eta-bubble">
            <strong>{etaMinutes ? `In ${etaMinutes} min` : "Live location"}</strong>
            <span>{remainingDistance !== undefined && remainingDistance !== null ? `${remainingDistance} km away` : "Tracking in real time"}</span>
          </div>
        )}

        {mapPosition ? (

          <MapContainer
            center={mapPosition}
            zoom={14}
            scrollWheelZoom={true}
            className="live-map"
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
              position={mapPosition}
            />


            {/* ROUTE */}

            {stopCoordinates.length >
              1 && (
              <Polyline
                positions={
                  stopCoordinates
                }
              />
            )}


            {/* BUS */}

            {!tripEnded && (
              <Marker
                position={mapPosition}
                icon={busIcon}
              >

                <Popup>

                  <strong>
                    {trip?.bus
                      ?.busNumber ||
                      "Bus"}
                  </strong>

                  <br />

                  {isLive
                    ? `Live • ${
                        location?.speed ||
                        0
                      } km/h`
                    : "Trip ended"}

                </Popup>

              </Marker>
            )}


            {/* STOPS */}

            {stops.map((stop) => (

              <Marker
                key={stop._id}
                position={[
                  stop.location
                    .latitude,
                  stop.location
                    .longitude,
                ]}
              >

                <Popup>

                  <strong>
                    {stop.name}
                  </strong>

                  <br />

                  Stop #{stop.sequence}

                </Popup>

              </Marker>

            ))}

          </MapContainer>

        ) : (

          <div className="map-empty">

            <div>
              🚌
            </div>

            <h3>
              {tripEnded
                ? "Trip has ended"
                : "Waiting for bus location"}
            </h3>

            <p>
              {tripEnded
                ? "Live location is no longer available."
                : "The driver has not shared a GPS location yet."}
            </p>

          </div>

        )}

      </div>


      {/* ==============================================
          INFO CARDS
      ============================================== */}

      <div className="tracking-map-actions">
        <button type="button" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
      </div>

      <div className="tracking-info">

        <div className="live-bus-title">
          <div>
            <strong>{trip?.bus?.busNumber || "Bus"}</strong>
            <span>{trip?.bus?.operator?.name || "Bus Mitra Travels"}</span>
          </div>
          <button type="button" onClick={() => window.location.reload()} aria-label="Refresh live location"><FaSyncAlt /></button>
        </div>

        <div className="tracking-card">

          <span>
            Current Stop
          </span>

          <strong>
            {trip?.currentStop
              ?.name ||
              "Updating..."}
          </strong>

        </div>


        <div className="tracking-card">

          <span>
            Next Stop
          </span>

          <strong>
            {trip?.nextStop
              ?.name ||
              "Updating..."}
          </strong>

        </div>


        <div className="tracking-card">

          <span>
            Speed
          </span>

          <strong>
            {isLive
              ? `${location?.speed || trip?.currentSpeed || 0} km/h`
              : "—"}
          </strong>

        </div>


        <div className="tracking-card">

          <span>
            Last Updated
          </span>

          <strong>
            {location?.recordedAt
              ? new Date(
                  location.recordedAt
                ).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "—"}
          </strong>

        </div>

      </div>

      <section className="journey-progress-card">
        <div className="journey-progress-head">
          <strong>Journey Progress</strong>
          <span>{stops.length ? `${Math.min(stops.length, 1)} of ${stops.length} stops` : "Route loading"}</span>
        </div>
        <div className="journey-progress-bar"><i style={{ width: stops.length ? `${100 / stops.length}%` : "0%" }} /></div>
        <div className="journey-stop-list">
          {stops.length ? stops.map((stop, index) => (
            <div key={stop._id} className={index === 0 ? "current" : "upcoming"}>
              <span>{index === 0 ? <FaBus /> : ""}</span>
              <strong>{stop.name}</strong>
              <small>{stop.estimatedArrivalMinutes !== undefined ? `${stop.estimatedArrivalMinutes} min` : ""}</small>
            </div>
          )) : <p>Stops will appear when route details are configured.</p>}
        </div>
      </section>

      <nav className="tracking-bottom-nav">
        <button className="active"><FaBus /><span>Track Bus</span></button>
        <button><FaRoute /><span>Route Details</span></button>
        <button><FaList /><span>All Stops</span></button>
        <button onClick={() => navigate("/contact")}><FaExclamationTriangle /><span>Report Issue</span></button>
      </nav>

    </div>
  );
}

export default TrackBus;
