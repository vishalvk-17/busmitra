import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import authService from "../../services/authService";
import "./Contact.css";

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", description: "", category: "service" });
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submitComplaint = async (event) => { event.preventDefault(); setError(""); try { if (!authService.getToken()) return navigate("/login"); await api.post("/support/complaints", form); setForm({ subject: "", description: "", category: "service" }); setMessage("Your issue has been sent to our support team."); } catch (err) { setError(err.response?.data?.message || "Unable to submit your issue."); } };
  const submitFeedback = async (event) => { event.preventDefault(); setError(""); try { if (!authService.getToken()) return navigate("/login"); await api.post("/support/feedback", { rating: Number(rating), message: feedback }); setFeedback(""); setMessage("Thanks for your feedback!"); } catch (err) { setError(err.response?.data?.message || "Unable to submit feedback."); } };
  return <main className="contact-page"><header><Link to="/dashboard">Bus Mitra</Link><h1>How can we help?</h1><p>Send an issue or share feedback with the Bus Mitra team.</p></header>{error && <p className="contact-error">{error}</p>}{message && <p className="contact-success">{message}</p>}<div className="contact-grid"><form onSubmit={submitComplaint}><h2>Report an issue</h2><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="service">Service</option><option value="driver">Driver</option><option value="bus">Bus</option><option value="route">Route</option><option value="other">Other</option></select></label><label>Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}/></label><label>Describe the issue<textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><button>Submit issue</button></form><form onSubmit={submitFeedback}><h2>Feedback & rating</h2><label>Your rating<select value={rating} onChange={(e) => setRating(e.target.value)}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label>Your feedback<textarea required value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Tell us what went well or how we can improve."/></label><button>Send feedback</button></form></div></main>;
}
