import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", profileImage: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { authService.getMe().then(({ user }) => { setForm({ name: user.name || "", phone: user.phone || "", profileImage: user.profileImage || "" }); setLoading(false); }).catch(() => navigate("/login")); }, [navigate]);
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); setMessage(""); try { await authService.updateMe(form); setMessage("Your profile has been updated."); } catch (err) { setError(err.response?.data?.message || "Unable to update profile."); } finally { setSaving(false); } };
  if (loading) return <main className="profile-page">Loading profile...</main>;
  return <main className="profile-page"><div className="profile-card"><Link to="/dashboard">← Dashboard</Link><h1>My Profile</h1><p>Manage the details attached to your Bus Mitra account.</p><form onSubmit={submit}><div className="profile-avatar">{form.name?.charAt(0)?.toUpperCase() || "P"}</div><label>Full name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Phone number<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>Profile image URL <small>(optional)</small><input value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} /></label>{error && <p className="profile-error">{error}</p>}{message && <p className="profile-success">{message}</p>}<button disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></form></div></main>;
}
