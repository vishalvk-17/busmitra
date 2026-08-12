import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBars,
  FaBell,
  FaBus,
  FaCrosshairs,
  FaExclamationTriangle,
  FaFlag,
  FaList,
  FaMapMarkerAlt,
  FaPlus,
  FaMinus,
  FaRoute,
  FaShareAlt,
  FaStar,
  FaSyncAlt,
  FaTachometerAlt,
  FaUserCircle,
} from "react-icons/fa";

import liveTrackingService from "../../services/liveTrackingService";
import tripService from "../../services/tripService";

import "./TrackBus.css";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

/* Leaflet map implementation removed; Google Maps is initialized below. */
/*
const busIcon = L.divIcon({
  className: "bus-map-icon",
  html: `<div class="bus-marker"><span>🚌</span></div>`,
  iconSize: [70, 70],
  iconAnchor: [35, 35],
});

const makeStopIcon = (type = "upcoming") =>
  L.divIcon({
    className: `stop-map-icon stop-${type}`,
    html: `<div class="stop-dot"><span>${type === "passed" ? "✓" : ""}</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

function MapController({ position, route }) {
  const map = useMap();
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (hasFitted || !map) return;

    if (route?.length > 1) {
      map.fitBounds(L.latLngBounds(route), {
        padding: [70, 90],
        maxZoom: 12,
        animate: false,
      });
      setHasFitted(true);
      return;
    }

    if (position) {
      map.setView(position, 14, { animate: false });
      setHasFitted(true);
    }
  }, [map, position, route, hasFitted]);

  return null;
}

function MapControls({ position }) {
  const map = useMap();

  return (
    <div className="reference-map-controls">
      <button type="button" onClick={() => position && map.flyTo(position, Math.max(map.getZoom(), 14), { animate: true, duration: 0.6 })} aria-label="Locate bus">
        <FaCrosshairs />
      </button>
      <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in">
        <FaPlus />
      </button>
      <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out">
        <FaMinus />
      </button>
    </div>
  );
}
*/

function GoogleTrackingMap({ busPosition, stops, stopNames, currentStopIndex, tripEnded, mapApiRef }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef({ bus: null, route: null, stops: [] });
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (!GOOGLE_MAPS_KEY) { setMapError("Google Maps API key is not configured."); return undefined; }
    const createMap = () => {
      if (!mapElementRef.current || mapRef.current) return;
      mapRef.current = new window.google.maps.Map(mapElementRef.current, { center: busPosition || stops[0] || { lat: 23.2599, lng: 77.4126 }, zoom: 13, disableDefaultUI: true, gestureHandling: "greedy" });
      mapApiRef.current = mapRef.current;
    };
    if (window.google?.maps) { createMap(); return undefined; }
    const script = document.getElementById("google-maps-javascript-api") || document.createElement("script");
    const fail = () => setMapError("Google Maps could not be loaded. Check the API key and allowed domain.");
    script.addEventListener("load", createMap); script.addEventListener("error", fail);
    if (!script.id) { script.id = "google-maps-javascript-api"; script.async = true; script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}`; document.head.appendChild(script); }
    return () => { script.removeEventListener("load", createMap); script.removeEventListener("error", fail); };
  }, [busPosition, stops, mapApiRef]);

  useEffect(() => {
    const map = mapRef.current; if (!map || !window.google?.maps) return;
    const overlays = overlaysRef.current;
    overlays.bus?.setMap(null); overlays.route?.setMap(null); overlays.stops.forEach((marker) => marker.setMap(null));
    if (stops.length > 1) overlays.route = new window.google.maps.Polyline({ path: stops, strokeColor: "#1264f5", strokeOpacity: 1, strokeWeight: 6, map });
    overlays.stops = stops.map((position, index) => new window.google.maps.Marker({ position, map, title: stopNames[index] || `Stop ${index + 1}`, label: { text: String(index + 1), color: "#1264f5", fontWeight: "700", fontSize: "11px" }, icon: { path: window.google.maps.SymbolPath.CIRCLE, fillColor: index < currentStopIndex ? "#20b96b" : "#ffffff", fillOpacity: 1, strokeColor: index < currentStopIndex ? "#20b96b" : "#1264f5", strokeWeight: 3, scale: 10 } }));
    if (busPosition && !tripEnded) { overlays.bus = new window.google.maps.Marker({ position: busPosition, map, icon: { url: "/bus-marker.svg", scaledSize: new window.google.maps.Size(70, 70), anchor: new window.google.maps.Point(35, 35) }, zIndex: 20 }); map.panTo(busPosition); }
  }, [busPosition, stops, currentStopIndex, tripEnded]);

  return mapError ? <div className="map-empty"><h3>Map unavailable</h3><p>{mapError}</p></div> : <div ref={mapElementRef} className="google-live-map" />;
}

const relativeTime = (date) => {
  if (!date) return "Just now";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
};

const formatTime = (minutesFromNow) => {
  const d = new Date(Date.now() + Math.max(0, minutesFromNow || 0) * 60000);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

function TrackBus() {
  const navigate = useNavigate();
  const googleMapRef = useRef(null);
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("trip");

  const [trip, setTrip] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [tripEnded, setTripEnded] = useState(false);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      setError("No trip selected for tracking.");
      return undefined;
    }

    let socket;

    const startTracking = async () => {
      try {
        setLoading(true);
        setError("");

        const tripData = await tripService.getTripById(tripId);
        setTrip(tripData.trip);

        if (tripData.trip?.status === "completed") {
          setTripEnded(true);
        }

        try {
          const locationData = await liveTrackingService.getLatestLocation(tripId);
          const latest = locationData.location;

          if (latest?.location?.latitude != null && latest?.location?.longitude != null) {
            setLocation({
              latitude: latest.location.latitude,
              longitude: latest.location.longitude,
              speed: latest.speed || 0,
              heading: latest.heading || 0,
              accuracy: latest.accuracy,
              recordedAt: latest.recordedAt,
            });
          }
        } catch {
          console.log("No live location available.");
        }

        socket = liveTrackingService.createSocket();

        socket.on("connect", () => {
          setSocketConnected(true);
          liveTrackingService.joinTrip(socket, tripId);
        });

        socket.on("disconnect", () => setSocketConnected(false));

        socket.on("bus-location-updated", (data) => {
          if (data.tripId !== tripId) return;

          setLocation({
            latitude: data.location?.latitude,
            longitude: data.location?.longitude,
            speed: data.speed || 0,
            heading: data.heading || 0,
            accuracy: data.accuracy,
            recordedAt: data.recordedAt,
          });

          setTripEnded(false);
          setTrip((prev) => (prev ? { ...prev, status: "running" } : prev));
        });

        socket.on("trip-started", (data) => {
          if (data.tripId !== tripId) return;
          setTrip((prev) => (prev ? { ...prev, status: "running", startedAt: data.startedAt } : prev));
          setTripEnded(false);
        });

        socket.on("trip-ended", (data) => {
          if (data.tripId !== tripId) return;
          setTrip((prev) => (prev ? { ...prev, status: "completed", endedAt: data.endedAt } : prev));
          setTripEnded(true);
        });
      } catch (err) {
        console.error("Tracking Error:", err);
        setError(err.response?.data?.message || "Unable to load live tracking.");
      } finally {
        setLoading(false);
      }
    };

    startTracking();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [tripId]);

  if (loading) {
    return (
      <div className="track-bus-page loading-screen">
        <div className="tracking-loading">
          <div className="loading-spinner" />
          <h2>Loading live tracking...</h2>
          <p>Connecting to the bus.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-bus-page">
        <div className="tracking-error">
          <h2>Tracking unavailable</h2>
          <p>{error}</p>
          <button type="button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  const mapPosition = location?.latitude != null && location?.longitude != null
    ? { lat: location.latitude, lng: location.longitude }
    : null;

  const stops =
    trip?.route?.stops
      ?.filter((stop) => stop.location?.latitude != null && stop.location?.longitude != null)
      ?.sort((a, b) => a.sequence - b.sequence) || [];

  const stopCoordinates = stops.map((stop) => ({ lat: stop.location.latitude, lng: stop.location.longitude }));
  const isLive = trip?.status === "running" && !tripEnded;
  const remainingDistance = trip?.remainingDistanceKm;
  const speed = location?.speed || trip?.currentSpeed || 0;
  const etaMinutes = remainingDistance != null
    ? Math.max(1, Math.round((remainingDistance / Math.max(speed || 35, 15)) * 60))
    : null;

  const currentStopId = trip?.currentStop?._id || trip?.currentStop?.id;
  const currentStopName = trip?.currentStop?.name;
  const currentStopSequence = trip?.currentStop?.sequence;
  const foundCurrentStopIndex = stops.findIndex((stop) =>
    (currentStopId && String(stop._id) === String(currentStopId)) ||
    (currentStopName && stop.name === currentStopName) ||
    (currentStopSequence != null && Number(stop.sequence) === Number(currentStopSequence))
  );
  const currentStopIndex = foundCurrentStopIndex >= 0 ? foundCurrentStopIndex : 0;
  const progressIndex = stops.length ? currentStopIndex + 1 : 0;
  const progress = stops.length ? Math.min(100, (progressIndex / stops.length) * 100) : 0;
  const currentStop = trip?.currentStop?.name || stops[currentStopIndex]?.name || "Updating...";
  const nextStop = trip?.nextStop?.name || stops[currentStopIndex + 1]?.name || "Destination";
  const currentLocationLabel = currentStop === "Updating..." ? "Current Location" : currentStop;

  return (
    <div className="track-bus-page">
      <header className="tracking-topbar">
        <button type="button" className="tracking-menu-btn" aria-label="Open menu"><FaBars /></button>
        <div className="tracking-brand">
          <span><FaBus /></span>
          <strong>Bus <em>Mitra</em></strong>
        </div>
        <div className="tracking-top-actions">
          <button type="button"><FaShareAlt /><span>Share</span></button>
          <button type="button" onClick={() => window.location.reload()}><FaSyncAlt /><span>Refresh</span></button>
          <button type="button" aria-label="Notifications"><FaBell /></button>
          <FaUserCircle />
        </div>
      </header>

      <div className="tracking-workspace">
        <aside className="tracking-side-panel">
          <div className="bus-details-card">
            <div className="side-card-top">
              <button type="button" className="back-button" onClick={() => navigate(-1)}>
                <FaArrowLeft /> <span>Back</span>
              </button>
              <span className={`live-pill ${isLive ? "live" : "ended"}`}>
                <i /> {isLive ? "Live" : "Ended"}
              </span>
            </div>

            <div className="bus-heading-row">
              <div className="bus-heading">
                <FaBus />
                <div>
                  <h1>{trip?.bus?.busNumber || "MP 09 FA 1234"}</h1>
                  <p>{trip?.bus?.operator?.name || "Shiv Shakti Travels"}</p>
                </div>
              </div>
              <button type="button" className="favorite-button" aria-label="Favorite bus"><FaStar /></button>
            </div>

            <div className="on-time-card">
              <div className="on-time-icon"><i /></div>
              <div>
                <strong>Bus is On Time</strong>
                <span>Last updated {relativeTime(location?.recordedAt)}</span>
              </div>
              <div className="signal-bars"><i /><i /><i /><i /></div>
            </div>

            <div className="eta-grid">
              <div>
                <span>ETA</span>
                <strong>{etaMinutes ? `${etaMinutes} min` : "—"}</strong>
                <small>{etaMinutes ? formatTime(etaMinutes) : "Updating"}</small>
              </div>
              <div>
                <span>Distance Left</span>
                <strong>{remainingDistance != null ? `${remainingDistance} km` : "—"}</strong>
                <small>&nbsp;</small>
              </div>
            </div>

            <div className="detail-row">
              <FaTachometerAlt />
              <div>
                <span>Current Speed</span>
                <strong>{isLive ? `${speed} km/h` : "—"}</strong>
              </div>
            </div>

            <div className="detail-row location-detail">
              <FaMapMarkerAlt />
              <div>
                <span>Current Location</span>
                <strong>{currentLocationLabel}{trip?.route?.origin ? `, ${trip.route.origin}` : ""}</strong>
                <button type="button" onClick={() => document.querySelector(".reference-map-controls button")?.click()}>
                  View on Map <span>›</span>
                </button>
              </div>
            </div>

            <div className="detail-row next-stop-detail">
              <FaFlag />
              <div>
                <span>Next Stop</span>
                <strong>{nextStop}</strong>
                <small>{etaMinutes ? `In ${Math.max(1, Math.round(etaMinutes / 2))} min` : "Updating"}{remainingDistance != null ? ` (${remainingDistance} km)` : ""}</small>
              </div>
            </div>
          </div>

          <section className="journey-progress-card">
            <div className="journey-progress-head">
              <strong>Journey Progress</strong>
              <span>{stops.length ? `${progressIndex} of ${stops.length} stops` : "Route loading"}</span>
            </div>
            <div className="journey-progress-meta">
              <div className="journey-progress-bar"><i style={{ width: `${progress}%` }} /></div>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="journey-stop-list">
              {stops.length ? stops.map((stop, index) => {
                const passed = index < currentStopIndex;
                const current = index === currentStopIndex;
                return (
                  <div key={stop._id || stop.sequence} className={`${passed ? "passed" : ""} ${current ? "current" : "upcoming"}`}>
                    <span className="timeline-dot">{passed ? "✓" : current ? <FaBus /> : ""}</span>
                    <strong>{stop.name}</strong>
                    <small>{stop.estimatedArrivalMinutes != null ? `${stop.estimatedArrivalMinutes} min` : ""}</small>
                  </div>
                );
              }) : <p>Stops will appear when route details are configured.</p>}
            </div>
          </section>
        </aside>

        <main className="tracking-map-shell">
          <div className="map-backdrop-content">
            <span className="map-city city-bhopal">{trip?.route?.origin || "Bhopal"}</span>
            <span className="map-city city-indore">{trip?.route?.destination || "Indore"}</span>
          </div>

          {(mapPosition || stopCoordinates.length) ? (
            <>
              <GoogleTrackingMap busPosition={mapPosition} stops={stopCoordinates} stopNames={stops.map((stop) => stop.name)} currentStopIndex={currentStopIndex} tripEnded={tripEnded} mapApiRef={googleMapRef} />
              <div className="reference-map-controls">
                <button type="button" onClick={() => mapPosition && googleMapRef.current?.panTo(mapPosition)} aria-label="Recenter on bus"><FaCrosshairs /></button>
              </div>
            </>
          ) : (
            <div className="map-empty">
              <div>🚌</div>
              <h3>{tripEnded ? "Trip has ended" : "Waiting for bus location"}</h3>
              <p>{tripEnded ? "Live location is no longer available." : "The driver has not shared a GPS location yet."}</p>
            </div>
          )}

          <div className="map-route-title">
            <span>{trip?.route?.origin || "Origin"}</span>
            <b>→</b>
            <span>{trip?.route?.destination || "Destination"}</span>
          </div>

          <div className="socket-chip">
            <i className={socketConnected ? "connected" : "disconnected"} />
            {socketConnected ? "Live" : "Connecting"}
          </div>
        </main>
      </div>

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
