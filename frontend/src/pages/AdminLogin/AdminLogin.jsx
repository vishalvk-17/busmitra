import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => { event.preventDefault(); setSubmitting(true); setError(""); try { const { data } = await api.post("/admin/login", { email, password }); localStorage.setItem("busMitraToken", data.token); localStorage.setItem("busMitraUser", JSON.stringify(data.user)); navigate("/admin/dashboard"); } catch (err) { setError(err.response?.data?.message || "Unable to sign in."); } finally { setSubmitting(false); } };
  return <main className="admin-login-page"><section className="admin-login-card"><span>Bus Mitra</span><h1>Super Admin Login</h1><p>Secure access to platform management.</p><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="admin-login-error">{error}</p>}<button disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button></form><Link to="/login">Back to passenger login</Link></section></main>;
}
