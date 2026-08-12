import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaBus,
  FaChargingStation,
  FaClock,
  FaHeart,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaMoon,
  FaRoad,
  FaRoute,
  FaShareAlt,
  FaSnowflake,
  FaSun,
  FaTicketAlt,
  FaUserCircle,
  FaWifi,
} from "react-icons/fa";
import routeService from "../../services/routeService";
import tripService from "../../services/tripService";
import "./RouteDetails.css";

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busNumber, setBusNumber] = useState("");
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    Promise.all([routeService.getRouteById(id), tripService.getTrips({ route: id, limit: 30 })])
      .then(([routeData, tripData]) => { setRoute(routeData.route); setTrips(tripData.trips || []); })
      .catch((err) => setError(err.response?.data?.message || "Unable to load route details."))
      .finally(() => setLoading(false));
  }, [id]);

  const stops = useMemo(() => (route?.stops || []).slice().sort((a, b) => a.sequence - b.sequence), [route]);
  const runningTrips = trips.filter((trip) => trip.status === "running");
  const trackRouteBus = (event) => { event.preventDefault(); const trip = runningTrips.find((item) => !busNumber || item.bus?.busNumber?.toLowerCase() === busNumber.trim().toLowerCase()) || runningTrips[0]; if (trip) navigate(`/track-bus?trip=${trip._id}`); else setError("No live bus is currently available on this route."); };

  if (loading) return <main className="route-details-loading">Loading route details...</main>;
  if (error && !route) return <main className="route-details-loading"><p>{error}</p><button onClick={() => navigate(-1)}>Go back</button></main>;

  const totalBuses = route?.buses?.length || trips.length;
  return <main className="route-details-page">
    <header className="route-topbar"><button onClick={() => navigate(-1)} aria-label="Back"><FaArrowLeft /></button><Link to="/" className="route-brand"><span><FaBus /></span><strong>Bus <em>Mitra</em></strong></Link><div><button aria-label="Save route"><FaHeart /></button><button aria-label="Share route"><FaShareAlt /></button><button aria-label="Notifications"><FaBell /></button><FaUserCircle /></div></header>
    <section className="route-hero"><div><h1>{route.origin} <FaArrowRight /> {route.destination}</h1><p>{route.routeName || "Your connected city route"}</p><div className="route-status-pills"><span><i /> Live Tracking</span><span><FaBus /> {totalBuses || "—"} Buses Running</span></div></div><div className="route-hero-bus"><FaRoad /><FaBus /><FaMapMarkerAlt /></div></section>
    <section className="route-summary"><Summary icon={<FaRoad />} label="Distance" value={`${route.distanceKm ?? "—"} km`} /><Summary icon={<FaClock />} label="Duration" value={route.estimatedDurationMinutes ? formatDuration(route.estimatedDurationMinutes) : "—"} /><Summary icon={<FaSun />} label="First Bus" value={route.firstBusTime || "—"} /><Summary icon={<FaMoon />} label="Last Bus" value={route.lastBusTime || "—"} /><p><FaBell /> Travel time may vary due to traffic and road conditions.</p></section>
    <nav className="route-tabs"><button className={tab === "overview" ? "active" : ""} onClick={() => setTab("overview")}><FaRoute /> Route Overview</button><button className={tab === "buses" ? "active" : ""} onClick={() => setTab("buses")}><FaBus /> Running Buses</button><button className={tab === "time" ? "active" : ""} onClick={() => setTab("time")}><FaClock /> Timetable</button><button><FaBell /> Alerts</button></nav>
    {error && <p className="route-inline-error">{error}</p>}
    <div className="route-details-grid">
      <section className="route-stops-card"><header><h2>{tab === "buses" ? "Running Buses" : `All Stops (${stops.length})`}</h2><button><FaMapMarkerAlt /> View on Map</button></header>{tab === "buses" ? <RunningTrips trips={runningTrips} onTrack={(trip) => navigate(`/track-bus?trip=${trip._id}`)} /> : <StopsTimeline stops={stops} />}{tab !== "buses" && <button className="full-map-button"><FaMapMarkedAlt /> View Full Route on Map <FaArrowRight /></button>}</section>
      <aside className="route-side-cards"><section><h2><FaBus /> About This Route</h2><p>{route.routeName || `${route.origin} to ${route.destination}`} connects commuters with frequent buses throughout the day. Check live buses for the latest departure information.</p><button>Read More <FaArrowRight /></button></section><section className="fare-card"><h2>₹ Average Fare</h2><strong>₹{route.fare ?? "—"}</strong><p>Price may vary by bus operator and bus type.</p><button>View Fare Breakdown</button></section><section><h2><FaClock /> Schedule Summary</h2><dl><div><dt>First Bus</dt><dd>{route.firstBusTime || "—"}</dd></div><div><dt>Last Bus</dt><dd>{route.lastBusTime || "—"}</dd></div><div><dt>Buses / Day</dt><dd>{totalBuses || "—"}</dd></div><div><dt>Avg. Interval</dt><dd>{route.estimatedDurationMinutes ? "30 – 45 min" : "—"}</dd></div></dl></section><section><h2><FaBus /> Amenities on Buses</h2><div className="amenity-row"><span><FaSnowflake />AC</span><span><FaWifi />Wi-Fi</span><span><FaChargingStation />Charging Point</span><span><FaMapMarkerAlt />Live Tracking</span></div></section></aside>
    </div>
    <form className="route-track-bar" onSubmit={trackRouteBus}><div><FaMapMarkerAlt /><span><strong>Track Any Bus on This Route</strong><small>Enter bus number to track live location</small></span></div><input value={busNumber} onChange={(e) => setBusNumber(e.target.value)} placeholder="Enter Bus Number" /><button>Track Bus</button></form>
    <nav className="route-bottom-nav"><button onClick={() => navigate("/")}><FaBus />Home</button><button onClick={() => navigate("/search-bus")}><FaMapMarkerAlt />Search</button><button className="active"><FaMapMarkerAlt />Track Bus</button><button><FaTicketAlt />My Bookings</button><button onClick={() => navigate("/profile")}><FaUserCircle />Profile</button></nav>
  </main>;
}

function Summary({ icon, label, value }) { return <article><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article>; }
function StopsTimeline({ stops }) { if (!stops.length) return <p className="route-empty">Stops have not been configured for this route yet.</p>; return <div className="stops-timeline">{stops.map((stop, index) => <article className={index === 0 ? "start" : index === stops.length - 1 ? "end" : ""} key={stop._id}><span>{index + 1}</span><div><strong>{stop.name}</strong><small>{stop.city || stop.address || "Route stop"}</small></div><time>{stop.estimatedArrivalMinutes !== undefined ? `${stop.estimatedArrivalMinutes} min` : ""}</time></article>)}</div>; }
function RunningTrips({ trips, onTrack }) { return trips.length ? <div className="running-trip-list">{trips.map((trip) => <article key={trip._id}><FaBus /><div><strong>{trip.bus?.busNumber || "Bus"}</strong><small>{trip.driver?.name || "Driver assigned"}</small></div><button onClick={() => onTrack(trip)}>Track Live</button></article>)}</div> : <p className="route-empty">No live buses are running on this route right now.</p>; }
function formatDuration(minutes) { const hours = Math.floor(minutes / 60); const remaining = minutes % 60; return `${hours ? `${hours}h ` : ""}${remaining}m`; }
