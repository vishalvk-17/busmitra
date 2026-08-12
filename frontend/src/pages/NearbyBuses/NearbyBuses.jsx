import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBell, FaBus, FaCrosshairs, FaFilter, FaHeart, FaLayerGroup, FaMapMarkerAlt, FaRegBookmark, FaSearch, FaUserCircle, FaWalking } from "react-icons/fa";
import liveTrackingService from "../../services/liveTrackingService";
import "./NearbyBuses.css";

const BHOPAL = { latitude: 23.2599, longitude: 77.4126, label: "Near Berasia Phatak, Bhopal" };
const colors = ["green", "blue", "orange", "red"];

export default function NearbyBuses() {
  const navigate = useNavigate();
  const [position, setPosition] = useState(BHOPAL);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState("distance");
  const [radius, setRadius] = useState(10);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setPosition({ latitude: coords.latitude, longitude: coords.longitude, label: "Your current location" }),
      () => setMessage("Location permission nahi mili — Bhopal location se buses dikhayi ja rahi hain."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await liveTrackingService.getNearbyBuses({ ...position, radius });
        setBuses(data.buses || []);
        if (!data.buses?.length) setMessage("Abhi is radius mein koi live bus available nahi hai.");
      } catch (error) {
        setMessage(error.response?.data?.message || "Nearby buses load nahi ho paayi. Please retry karein.");
      } finally { setLoading(false); }
    };
    load();
  }, [position.latitude, position.longitude, radius]);

  const visibleBuses = useMemo(() => [...buses].sort((a, b) => sort === "distance" ? a.distanceKm - b.distanceKm : new Date(a.updatedAt) - new Date(b.updatedAt)), [buses, sort]);
  const requestLocation = () => navigator.geolocation?.getCurrentPosition(({ coords }) => setPosition({ latitude: coords.latitude, longitude: coords.longitude, label: "Your current location" }), () => setMessage("Location permission allow karke phir try karein."));

  return <main className="nearby-page">
    <header className="nearby-topbar"><button onClick={() => navigate(-1)} aria-label="Back"><FaArrowLeft /></button><Link to="/" className="nearby-brand"><span><FaBus /></span><b>Bus <em>Mitra</em></b></Link><div><button aria-label="Notifications"><FaBell /></button><Link to="/profile" aria-label="Profile"><FaUserCircle /></Link></div></header>
    <section className="nearby-heading"><div><h1>Nearby Buses</h1><p><FaMapMarkerAlt /> {position.label}</p></div><button onClick={requestLocation}><FaCrosshairs /> Change Location</button></section>
    <section className="nearby-map"><div className="map-legend"><span><i className="green"/>2–5 min away</span><span><i className="blue"/>6–10 min away</span><span><i className="orange"/>11–15 min away</span><span><i className="red"/>15+ min away</span></div><div className="nearby-place p1">Kolar Road</div><div className="nearby-place p2">Hoshangabad Road</div><div className="nearby-place p3">AIIMS Bhopal</div><div className="user-location"><span></span><b>{position.label === "Your current location" ? "You" : "Berasia Phatak"}</b></div>{visibleBuses.slice(0, 4).map((item, index) => <MapPin key={item.tripId} item={item} color={colors[index]} index={index} />)}<div className="map-controls"><button><FaCrosshairs /></button><button><FaLayerGroup /></button></div></section>
    <section className="nearby-list"><div className="nearby-sheet-handle"/><div className="nearby-list-header"><h2>Buses Near You</h2><div><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="distance">Sort by: Distance</option><option value="recent">Sort by: Latest</option></select><button onClick={() => setRadius(radius === 10 ? 25 : 10)} title="Change search radius"><FaFilter /></button></div></div>{loading ? <div className="nearby-loading">Finding live buses near you…</div> : visibleBuses.length ? visibleBuses.map((item, index) => <BusCard key={item.tripId} item={item} color={colors[index % colors.length]} navigate={navigate} />) : <div className="nearby-empty"><FaBus /><h3>No live buses found</h3><p>{message || "Try changing your location or increasing the search radius."}</p><button onClick={() => setRadius(25)}>Search within 25 km</button></div>}<div className="nearby-search-prompt"><FaMapMarkerAlt /><div><b>Can&apos;t find your bus?</b><span>Try searching by bus number</span></div><Link to="/search-bus">Search Bus</Link></div></section>
    {message && buses.length > 0 && <p className="nearby-note">{message}</p>}
    <nav className="nearby-nav"><Link to="/dashboard"><FaUserCircle />Home</Link><Link to="/search-bus"><FaSearch />Search</Link><Link className="active" to="/nearby-buses"><FaBus />Track Bus</Link><Link to="/profile"><FaRegBookmark />My Bookings</Link><Link to="/profile"><FaUserCircle />Profile</Link></nav>
  </main>;
}

function MapPin({ item, color, index }) { const positions = [[27,19],[63,15],[68,60],[38,73]]; const [left, top] = positions[index]; return <div className={`nearby-map-pin ${color}`} style={{ left: `${left}%`, top: `${top}%` }}><i><FaBus /></i><div><b>{item.bus?.busNumber || "Live Bus"}</b><span>{minutes(item.distanceKm)} min away</span></div></div>; }
function BusCard({ item, color, navigate }) { const bus = item.bus || {}; const distance = item.distanceKm || 0; return <article className="nearby-bus-card"><i className={`nearby-bus-icon ${color}`}><FaBus /></i><div className="nearby-bus-name"><h3>{bus.busNumber || "Live Bus"}</h3><p>{bus.operator?.name || item.route?.routeName || "Bus Mitra Operator"}</p><span>{formatType(bus.busType)}</span></div><div className={`nearby-distance ${color}`}><b>{minutes(distance)} min away</b><span><FaWalking /> {formatDistance(distance)}</span></div><div className="nearby-eta"><small>ETA</small><b>{Math.max(2, minutes(distance) + 1)} min</b><span>{item.estimatedArrivalTime ? new Date(item.estimatedArrivalTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Live"}</span></div><button className="nearby-track" onClick={() => navigate(`/track-bus?trip=${item.tripId}`)}><FaCrosshairs /> Track Live</button><button className="nearby-bookmark" aria-label="Save bus"><FaRegBookmark /></button></article>; }
function minutes(distance) { return Math.max(2, Math.round(distance * 5)); }
function formatDistance(distance) { return distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`; }
function formatType(type) { return type ? `${type.replace(/\b\w/g, (letter) => letter.toUpperCase())} Seater` : "Live Bus"; }
