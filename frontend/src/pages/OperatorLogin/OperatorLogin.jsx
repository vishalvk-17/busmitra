import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./OperatorLogin.css";

function OperatorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/operators/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("busMitraToken", token);
      localStorage.setItem("busMitraUser", JSON.stringify(user));

      navigate("/operator/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to log in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="operator-login-page">
      <section className="operator-login-card" aria-labelledby="operator-login-title">
        <span className="operator-login-eyebrow">Bus Mitra</span>
        <h1 id="operator-login-title">Operator login</h1>
        <p>Sign in to manage your buses, routes, and trips.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="operator-email">Email address</label>
          <input
            id="operator-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="operator-password">Password</label>
          <input
            id="operator-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="operator-login-error" role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in as operator"}
          </button>
        </form>

        <Link to="/login">Passenger login</Link>
      </section>
    </main>
  );
}

export default OperatorLogin;
