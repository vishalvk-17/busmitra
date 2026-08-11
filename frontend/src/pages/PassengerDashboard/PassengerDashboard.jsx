import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBell, FaBus, FaHeart, FaMapMarkedAlt, FaRoute, FaSearch, FaUser } from "react-icons/fa";
import api from "../../services/api";
import authService from "../../services/authService";
import "./PassengerDashboard.css";

const navItems = [["Dashboard", "/dashboard", FaBus], ["Search Bus", "/search-bus", FaSearch], ["Track Bus", "/track-bus", FaMapMarkedAlt], ["Routes", "/routes", FaRoute], ["Favorites", "/favorites", FaHeart], ["Profile", "/profile", FaUser]];

export default function PassengerDashboard() {
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, error: "", routes: [], trips: [], favorites: [], notifications: [] });
  const user = authService.getStoredUser();

  useEffect(() => {
    if (!authService.getToken()) { navigate("/login"); return; }
    Promise.all([api.get("/routes", { params: { limit: 4 } }), api.get("/trips", { params: { limit: 4 } }), api.get("/favorites"), api.get("/notifications")])
      .then(([routes, trips, favorites, notifications]) => setState({ loading: false, error: "", routes: routes.data.routes || [], trips: trips.data.trips || [], favorites: favorites.data.favorites || [], notifications: notifications.data.notifications || [] }))
      .catch((error) => setState((current) => ({ ...current, loading: false, error: error.response?.data?.message || "Unable to load your dashboard." })));
  }, [navigate]);

  const logout = () => { authService.logout(); navigate("/login"); };
  if (state.loading) return <main className="passenger-dashboard loading">Loading your dashboard...</main>;

  return <main className="passenger-dashboard">
    <aside className="passenger-sidebar"><Link className="passenger-brand" to="/dashboard"><FaBus /> Bus Mitra</Link><nav>{navItems.map(([label, path, Icon]) => <Link key={path} className={path === "/dashboard" ? "active" : ""} to={path}><Icon />{label}</Link>)}</nav><button onClick={logout}>Log out</button></aside>
    <section className="passenger-content"><header><div><p>Welcome back</p><h1>{user?.name || "Passenger"}</h1></div><Link to="/notifications" className="notification-button"><FaBell />{state.notifications.filter((item) => !item.isRead).length || ""}</Link></header>
      {state.error && <p className="passenger-error">{state.error}</p>}
      <section className="passenger-hero"><div><span>PLAN YOUR JOURNEY</span><h2>Where would you like to go?</h2><p>Find buses, compare routes, and track your trip in real time.</p><Link to="/search-bus">Search buses <FaSearch /></Link></div><div className="hero-route"><FaMapMarkedAlt /><strong>Live bus tracking</strong><small>Accurate location updates during every trip.</small></div></section>
      <section className="passenger-stats"><Stat icon={<FaRoute />} label="Available routes" value={state.routes.length} /><Stat icon={<FaBus />} label="Upcoming trips" value={state.trips.length} /><Stat icon={<FaHeart />} label="Saved favorites" value={state.favorites.length} /><Stat icon={<FaBell />} label="New updates" value={state.notifications.filter((item) => !item.isRead).length} /></section>
      <section className="passenger-grid"><Panel title="Upcoming buses" link="/search-bus" linkText="Search buses">{state.trips.length ? state.trips.map((trip) => <div className="passenger-row" key={trip._id}><div><strong>{trip.bus?.busNumber || "Bus"}</strong><span>{trip.route?.origin || "Origin"} → {trip.route?.destination || "Destination"}</span></div><div><small>{trip.scheduledStartTime ? new Date(trip.scheduledStartTime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Time pending"}</small>{trip.status === "running" && <button onClick={() => navigate(`/track-bus?trip=${trip._id}`)}>Track live</button>}</div></div>) : <Empty text="No upcoming trips are available right now." />}</Panel><Panel title="Popular routes" link="/routes" linkText="View all">{state.routes.length ? state.routes.map((route) => <Link className="passenger-row route-row" key={route._id} to={`/route/${route._id}`}><div><strong>{route.origin} → {route.destination}</strong><span>{route.routeName || route.routeNumber}</span></div><small>₹{route.fare ?? "—"} · {route.distanceKm ?? "—"} km</small></Link>) : <Empty text="Routes will appear here once published." />}</Panel></section>
      <section className="passenger-grid"><Panel title="Recent notifications" link="/notifications" linkText="View all">{state.notifications.slice(0, 3).map((item) => <div className="passenger-row" key={item._id}><div><strong>{item.title}</strong><span>{item.message}</span></div><small>{new Date(item.createdAt).toLocaleDateString()}</small></div>) || <Empty text="No notifications yet." />}</Panel><Panel title="Quick actions"><div className="quick-actions"><Link to="/favorites"><FaHeart />Saved buses</Link><Link to="/contact"><FaUser />Get support</Link><Link to="/profile"><FaUser />Manage profile</Link></div></Panel></section>
    </section>
  </main>;
}
function Stat({ icon, label, value }) { return <article><div>{icon}</div><span>{label}</span><strong>{value}</strong></article>; }
function Panel({ title, link, linkText, children }) { return <section className="dashboard-panel"><header><h2>{title}</h2>{link && <Link to={link}>{linkText}</Link>}</header>{children}</section>; }
function Empty({ text }) { return <p className="passenger-empty">{text}</p>; }
