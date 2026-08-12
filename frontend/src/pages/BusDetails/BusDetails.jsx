import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft, FaBell, FaBus, FaCamera, FaCheckCircle, FaClock,
  FaExclamationTriangle, FaHeart, FaMapMarkerAlt, FaPhoneAlt,
  FaShareAlt, FaSnowflake, FaStar, FaTachometerAlt, FaUserCircle,
  FaWifi, FaChargingStation, FaCrosshairs,
} from "react-icons/fa";
import busService from "../../services/busService";
import tripService from "../../services/tripService";
import favoriteService from "../../services/favoriteService";
import busImage from "../../assets/images/bus.png";
import "./BusDetails.css";

const fallbackStops = ["Bhopal ISBT", "Kolar Road", "Berasia Phatak", "Hoshangabad Road", "Obedullaganj", "Depalpur", "Indore Sarwate Stand"];

export default function BusDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const [busData, tripData] = await Promise.all([
          busService.getBusById(id),
          tripService.getTrips({ bus: id, limit: 20 }),
        ]);
        setBus(busData.bus);
        setTrips(tripData.trips || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load bus details");
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    favoriteService.checkFavorite("bus", id)
      .then((data) => { setIsFavorite(Boolean(data.isFavorite)); setFavoriteId(data.favoriteId || null); })
      .catch(() => {});
  }, [id]);

  const activeTrip = useMemo(() => trips.find((trip) => ["running", "boarding", "paused"].includes(trip.status)) || trips[0] || null, [trips]);
  const route = activeTrip?.route;
  const stops = fallbackStops;
  const currentStopIndex = Math.min(Math.max(activeTrip?.nextStop?.sequence ? activeTrip.nextStop.sequence - 1 : 3, 0), stops.length - 1);
  const speed = activeTrip?.currentSpeed || 42;
  const isLive = Boolean(activeTrip && ["running", "boarding", "paused"].includes(activeTrip.status) && (activeTrip.liveTracking || bus?.liveTracking));

  const toggleFavorite = async () => {
    try {
      setFavoriteLoading(true);
      if (isFavorite && favoriteId) {
        await favoriteService.removeFavorite(favoriteId); setIsFavorite(false); setFavoriteId(null);
      } else {
        const data = await favoriteService.addFavorite({ type: "bus", id });
        setIsFavorite(true); setFavoriteId(data.favorite?._id || null);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) navigate("/login");
    } finally { setFavoriteLoading(false); }
  };

  if (loading) return <div className="bus-page-state"><span className="bus-loader" />Loading bus details…</div>;
  if (error || !bus) return <div className="bus-page-state"><div><h2>Bus not found</h2><p>{error || "The requested bus could not be found."}</p><Link to="/search-bus">Back to Search</Link></div></div>;

  const operator = bus.operator?.name || "Bus Mitra Operator";
  const driver = activeTrip?.driver || bus.driver || {};
  const nextStop = activeTrip?.nextStop?.name || stops[currentStopIndex] || "Next stop";
  const destination = route?.destination || "Indore Sarwate Stand";
  const location = activeTrip?.currentLocation || bus.currentLocation;

  return <main className="bus-details-modern">
    <header className="bus-modern-topbar">
      <button aria-label="Go back" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <Link to="/" className="bus-brand"><span><FaBus /></span><b>Bus <em>Mitra</em></b></Link>
      <div className="bus-header-actions"><button aria-label="Favourite" className={isFavorite ? "is-favourite" : ""} onClick={toggleFavorite} disabled={favoriteLoading}><FaHeart /></button><button aria-label="Share"><FaShareAlt /></button><button aria-label="Notifications"><FaBell /></button></div>
    </header>

    <section className="bus-profile-card">
      <img src={busImage} alt={`${bus.busNumber} bus`} className="bus-photo" />
      <div className="bus-profile-main">
        <div className="bus-live-line"><span><FaCheckCircle /> {isLive ? "Live" : "Offline"}</span><small>Last updated {location?.updatedAt ? new Date(location.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "recently"}</small></div>
        <h1>{bus.busNumber}</h1><p className="bus-operator-name">{operator}</p>
        <p className="bus-rating"><FaStar /> 4.6 <span>(128 reviews)</span></p>
        <div className="bus-amenities"> <span><FaUserCircle /> {bus.totalSeats || 48} Seats</span>{amenityItems(bus.amenities).map(({ label, icon }) => <span key={label}>{icon} {label}</span>)}</div>
      </div>
      <div className="bus-live-panel"><div className={activeTrip?.delayMinutes > 0 ? "behind" : ""}><FaClock /><b>{activeTrip?.delayMinutes > 0 ? `${activeTrip.delayMinutes} min late` : "On Time"}</b><small>{activeTrip?.delayMinutes > 0 ? "Delay reported on this trip" : "Bus is running as per schedule"}</small></div><button onClick={() => activeTrip ? navigate(`/track-bus?trip=${activeTrip._id}`) : navigate("/search-bus")}><FaCrosshairs /> Track Live</button></div>
    </section>

    <section className="bus-stat-card">
      <Stat icon={<FaMapMarkerAlt />} label="Current Location" value={location?.latitude ? "Live location available" : `Near ${nextStop}`} action="View on Map" />
      <Stat icon={<FaTachometerAlt />} label="Current Speed" value={`${speed} km/h`} />
      <Stat icon={<FaBus />} label="Next Stop" value={nextStop} sub="Arriving shortly" />
      <Stat icon={<FaClock />} label="ETA at Destination" value={activeTrip?.estimatedArrivalTime ? time(activeTrip.estimatedArrivalTime) : "12:35 PM"} sub={destination} />
    </section>

    <section className="bus-journey-layout">
      <div className="bus-map-panel"><div className="map-city map-city-one">Bhopal</div><div className="map-city map-city-two">Indore</div><svg className="map-route" viewBox="0 0 600 430" preserveAspectRatio="none"><path d="M150,72 C200,126 224,100 265,170 S330,225 350,272 S392,330 412,380" /><circle cx="150" cy="72" r="8"/><circle cx="412" cy="380" r="8"/></svg><div className="map-bus-marker"><FaBus /></div><div className="map-bus-popover"><b>{bus.busNumber}</b><span>{speed} km/h</span></div><button className="map-locate"><FaCrosshairs /></button></div>
      <div className="journey-panel"><h2>Today&apos;s Journey</h2><JourneyStops stops={stops} currentIndex={currentStopIndex} activeTrip={activeTrip} destination={destination} /></div>
    </section>

    <section className="bus-info-grid">
      <Info label="Bus Type" value={formatBusType(bus.busType)} icon={<FaBus />} /><Info label="Operator" value={operator} icon={<FaUserCircle />} /><Info label="Bus Model" value="Tata Starbus" icon={<FaBus />} />
      <Info label="Driver Name" value={driver.name || "Driver not assigned"} icon={<FaUserCircle />} call={driver.phone} /><Info label="Driver Contact" value={driver.phone || "Not available"} icon={<FaPhoneAlt />} call={driver.phone} /><Info label="Conductor Contact" value="Not available" icon={<FaPhoneAlt />} />
    </section>

    <section className="bus-bottom-grid"><section className="recent-updates"><h2>Recent Updates</h2>{stops.slice(Math.max(0, currentStopIndex - 2), currentStopIndex + 1).reverse().map((stop, index) => <div className="update-row" key={stop}><i className={index === 0 ? "recent" : ""} /><b>{index === 0 ? "11:45 AM" : index === 1 ? "11:32 AM" : "11:20 AM"}</b><span>{index === 0 ? `Reached ${stop}` : `Departed ${stop}`}</span><small>{index === 0 ? "1 min ago" : `${14 + index * 12} min ago`}</small></div>)}<button>View All Updates ›</button></section><section className="quick-actions"><h2>Quick Actions</h2><div><Action icon={<FaShareAlt />} label="Share Bus Location" /><Action icon={<FaExclamationTriangle />} label="Report an Issue" /><Action icon={<FaPhoneAlt />} label="Call Operator" /><Action icon={<FaStar />} label="Add to Favorites" onClick={toggleFavorite} /><Action icon={<FaBell />} label="Set Arrival Alert" /><Action icon={<FaCamera />} label="Feedback" /></div></section></section>

    <nav className="bus-bottom-nav"><Link to="/dashboard"><FaUserCircle />Home</Link><Link to="/search-bus"><FaClock />Search</Link><Link className="active" to={activeTrip ? `/track-bus?trip=${activeTrip._id}` : "/track-bus"}><FaBus />Track Bus</Link><Link to="/profile"><FaClock />My Bookings</Link><Link to="/profile"><FaUserCircle />Profile</Link></nav>
  </main>;
}

function amenityItems(items = []) { const available = new Set(items); return [{ label: "AC", icon: <FaSnowflake /> }, { label: "CCTV", icon: <FaCamera /> }, { label: "Wi-Fi", icon: <FaWifi /> }, { label: "Charging", icon: <FaChargingStation /> }].filter((item) => available.size === 0 || available.has(item.label.toLowerCase()) || item.label === "CCTV" && available.has("cctv")); }
function Stat({ icon, label, value, sub, action }) { return <div className="bus-stat"><i>{icon}</i><span>{label}</span><b>{value}</b>{sub && <small>{sub}</small>}{action && <button>{action} ›</button>}</div>; }
function Info({ icon, label, value, call }) { return <div className="bus-info"><i>{icon}</i><span>{label}</span><b>{value}</b>{call && <a href={`tel:${call}`} aria-label={`Call ${label}`}><FaPhoneAlt /></a>}</div>; }
function Action({ icon, label, onClick }) { return <button onClick={onClick}><i>{icon}</i><span>{label}</span></button>; }
function JourneyStops({ stops, currentIndex, activeTrip, destination }) { return <ol className="journey-stops">{stops.map((stop, index) => { const done = index < currentIndex; const current = index === currentIndex; const last = index === stops.length - 1; return <li className={`${done ? "done" : ""} ${current ? "current" : ""} ${last ? "destination" : ""}`} key={stop}><i>{current ? <FaBus /> : done ? <FaCheckCircle /> : <span />}</i><div><b>{last ? destination : stop}</b><small>{last ? "Destination" : current ? "Next Stop" : index < currentIndex ? "Completed" : "Upcoming"}</small></div><time>{index === 0 ? "05:30 AM" : index === currentIndex ? "11:45 AM" : last ? "12:35 PM" : "12:05 PM"}</time></li>; })}</ol>; }
function formatBusType(value) { return value ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Non-AC Seater"; }
function time(value) { return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
