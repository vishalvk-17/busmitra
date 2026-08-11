import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../Auth/Auth.css";

export default function DriverLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); setLoading(true); try { const { data } = await api.post("/drivers/login", { email, password }); localStorage.setItem("busMitraToken", data.token); localStorage.setItem("busMitraUser", JSON.stringify(data.user)); navigate("/driver/dashboard"); } catch (err) { setError(err.response?.data?.message || "Unable to log in."); } finally { setLoading(false); } };
  return <main className="passenger-auth"><section className="passenger-auth-visual"><strong>Bus Mitra Driver</strong><h1>Start your trip and share live location.</h1><p>Passengers receive accurate real-time bus updates while you drive.</p></section><section className="passenger-auth-card"><h2>Driver login</h2><p>Use the credentials provided by your operator.</p><form onSubmit={submit}><label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="auth-error">{error}</p>}<button disabled={loading}>{loading ? "Logging in..." : "Driver login"}</button></form><p><Link to="/operator/login">Bus Owner / Operator login</Link></p></section></main>;
}
