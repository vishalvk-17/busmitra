import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLocationArrow, FaMapMarkerAlt, FaPowerOff } from "react-icons/fa";
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

  const loadTrips = async () => { try { const { data } = await api.get("/drivers/trips"); setTrips(data.trips || []); const active = data.trips?.find((trip) => trip.status === "running") || data.trips?.[0]; if (active) setSelectedTrip((current) => current || active._id); } catch (err) { if ([401, 403].includes(err.response?.status)) navigate("/driver/login"); else setError(err.response?.data?.message || "Unable to load your trips."); } };
  useEffect(() => { loadTrips(); return () => stopSharing(); }, []);
  const stopSharing = () => { if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current); watchId.current = null; setSharing(false); };
  const sendLocation = async (position) => { if (!selectedTrip) return; await api.post(`/live-location/${selectedTrip}`, { latitude: position.coords.latitude, longitude: position.coords.longitude, speed: Math.max(0, Math.round((position.coords.speed || 0) * 3.6)), heading: position.coords.heading || 0, accuracy: position.coords.accuracy || null }); setMessage(`Live location shared at ${new Date().toLocaleTimeString()}`); };
  const startSharing = async () => { setError(""); setMessage(""); if (!selectedTrip) return setError("Select a trip before sharing location."); if (!navigator.geolocation) return setError("This device does not support location sharing."); const trip = trips.find((item) => item._id === selectedTrip); try { if (trip?.status === "scheduled") await api.put(`/trips/${selectedTrip}/start`); watchId.current = navigator.geolocation.watchPosition((position) => sendLocation(position).catch((err) => setError(err.response?.data?.message || "Location could not be sent.")), (geoError) => setError(geoError.message || "Location permission is required."), { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }); setSharing(true); await loadTrips(); } catch (err) { setError(err.response?.data?.message || "Unable to start this trip."); } };
  const endTrip = async () => { try { stopSharing(); await api.put(`/trips/${selectedTrip}/end`); setMessage("Trip ended and location sharing stopped."); await loadTrips(); } catch (err) { setError(err.response?.data?.message || "Unable to end trip."); } };
  const logout = () => { stopSharing(); authService.logout(); navigate("/driver/login"); };
  const selected = trips.find((trip) => trip._id === selectedTrip);
  return <main className="driver-dashboard"><header><div><span>BUS MITRA</span><h1>Driver Console</h1></div><button onClick={logout}><FaPowerOff /> Log out</button></header><section className="driver-main"><div className="driver-status"><FaMapMarkerAlt /><div><span>{sharing ? "LIVE LOCATION ON" : "LOCATION OFF"}</span><h2>{sharing ? "Passengers can track your bus" : "Ready to start your trip"}</h2><p>{message || "Choose an assigned trip and allow location permission when you begin driving."}</p></div></div>{error && <p className="driver-error">{error}</p>}<section className="driver-card"><h2>Assigned trips</h2>{trips.length ? <div className="driver-trip-list">{trips.map((trip) => <label className={selectedTrip === trip._id ? "selected" : ""} key={trip._id}><input type="radio" name="trip" value={trip._id} checked={selectedTrip === trip._id} disabled={sharing} onChange={() => setSelectedTrip(trip._id)} /><div><strong>{trip.bus?.busNumber}</strong><span>{trip.route?.origin} → {trip.route?.destination}</span><small>{new Date(trip.scheduledStartTime).toLocaleString()}</small></div><em>{trip.status}</em></label>)}</div> : <p>No active or scheduled trips are assigned to you.</p>}</section>{selected && <section className="driver-card driver-actions"><h2>{selected.bus?.busNumber}: {selected.route?.origin} → {selected.route?.destination}</h2><p>Passenger tracking link becomes live after you start sharing GPS location.</p>{!sharing ? <button className="share-button" onClick={startSharing}><FaLocationArrow /> Start & share location</button> : <><button className="stop-button" onClick={stopSharing}>Pause sharing</button><button className="end-button" onClick={endTrip}>End trip</button></>}</section>}</section></main>;
}
