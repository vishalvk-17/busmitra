import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "../Auth/Auth.css";

export default function DriverLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Your existing backend currently expects "email".
      // So the UI can say Mobile Number / Driver ID while
      // keeping the existing API contract.
      const { data } = await api.post("/drivers/login", {
        email: identifier,
        password,
      });

      localStorage.setItem("busMitraToken", data.token);
      localStorage.setItem("busMitraUser", JSON.stringify(data.user));

      navigate("/driver/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="driver-login-page">
      {/* Top Hero */}
      <section className="driver-login-hero">
        <div className="driver-status-bar">
          <span>9:41</span>

          <div className="status-icons">
            <span className="signal-icon">▮▮▮</span>
            <span className="wifi-icon">⌁</span>
            <span className="battery-icon"></span>
          </div>
        </div>

        <div className="hero-content">
          {/* Bus Mitra Logo */}
          <div className="bus-mitra-logo">
            <div className="bus-logo-circle">
              <svg
                viewBox="0 0 100 100"
                className="bus-logo-svg"
                aria-hidden="true"
              >
                <rect
                  x="22"
                  y="25"
                  width="56"
                  height="58"
                  rx="12"
                  fill="none"
                  stroke="white"
                  strokeWidth="7"
                />

                <rect
                  x="31"
                  y="33"
                  width="38"
                  height="23"
                  rx="4"
                  fill="white"
                />

                <circle cx="35" cy="70" r="5" fill="white" />
                <circle cx="65" cy="70" r="5" fill="white" />

                <path
                  d="M42 72h16"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <path
                  d="M22 42h-7M78 42h7"
                  stroke="white"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Location pin */}
            <div className="location-pin">
              <svg viewBox="0 0 40 50" aria-hidden="true">
                <path
                  d="M20 2C10 2 3 10 3 20c0 13 17 27 17 27s17-14 17-27C37 10 30 2 20 2Z"
                  fill="white"
                />
                <circle cx="20" cy="19" r="6" fill="#1261ed" />
              </svg>
            </div>
          </div>

          <h1>Bus Mitra</h1>

          <div className="driver-title">
            <span></span>
            DRIVER
            <span></span>
          </div>

          <p>Safe Journey. On Time. Every Time.</p>
        </div>

        {/* Background city */}
        <div className="city-skyline">
          <div className="building building-1"></div>
          <div className="building building-2"></div>
          <div className="building building-3"></div>
          <div className="building building-4"></div>
          <div className="building building-5"></div>
          <div className="building building-6"></div>
        </div>

        {/* Bus illustration */}
        <div className="hero-bus">
          <div className="bus-body">
            <div className="bus-front"></div>
            <div className="bus-window"></div>
            <div className="bus-windshield"></div>
            <div className="bus-name">Bus Mitra</div>

            <div className="bus-wheel wheel-one">
              <span></span>
            </div>

            <div className="bus-wheel wheel-two">
              <span></span>
            </div>
          </div>
        </div>

        <div className="road">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>

      {/* Login Card */}
      <section className="driver-login-card">
        <div className="login-heading">
          <h2>
            Welcome Back, Driver! <span>👋</span>
          </h2>

          <p>Login to continue to your dashboard</p>
        </div>

        <form onSubmit={submit} className="driver-login-form">
          {/* Identifier */}
          <div className="driver-input-box">
            <div className="input-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="4"
                  y="3"
                  width="16"
                  height="18"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle
                  cx="12"
                  cy="9"
                  r="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 17c.8-2 2.2-3 4-3s3.2 1 4 3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="input-content">
              <label htmlFor="driverIdentifier">
                Mobile Number / Driver ID
              </label>

              <input
                id="driverIdentifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your mobile number or driver ID"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="driver-input-box">
            <div className="input-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="11"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
              </svg>
            </div>

            <div className="input-content">
              <label htmlFor="driverPassword">Password</label>

              <input
                id="driverPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24">
                  <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path
                    d="M3 3l18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.3 3.8M6.2 6.3C3.5 8.2 2 12 2 12s3.5 6 10 6c1.5 0 2.8-.3 4-.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Error */}
          {error && <p className="driver-auth-error">{error}</p>}

          {/* Remember + Forgot */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />

              <span className="custom-checkbox">
                {rememberMe && "✓"}
              </span>

              <span>Remember Me</span>
            </label>

            <Link to="/driver/forgot-password">
              Forgot Password?
            </Link>
          </div>

          {/* Login */}
          <button
            type="submit"
            className="driver-login-button"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M10 17l5-5-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 12H3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M14 5V3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5v-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <span>{loading ? "Logging in..." : "Login"}</span>
          </button>

          {/* OR */}
          <div className="login-divider">
            <span></span>
            <strong>OR</strong>
            <span></span>
          </div>

          {/* OTP */}
          <button
            type="button"
            className="otp-button"
            onClick={() => {
              // Add your OTP flow here later.
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="11.5" r="1" fill="currentColor" />
              <circle cx="12" cy="11.5" r="1" fill="currentColor" />
              <circle cx="16" cy="11.5" r="1" fill="currentColor" />
            </svg>

            <span>Login with OTP</span>
          </button>

          {/* Help */}
          <a href="tel:18001234567" className="driver-help">
            <div className="help-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 10V8a7 7 0 0 1 14 0v2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="3"
                  y="10"
                  width="4"
                  height="7"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <rect
                  x="17"
                  y="10"
                  width="4"
                  height="7"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M17 18c-.5 2-2 3-5 3h-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <strong>Need Help?</strong>
              <p>
                Contact Support: <span>1800-123-4567</span>
              </p>
            </div>

            <div className="help-arrow">›</div>
          </a>
        </form>

        <p className="version-text">Version 1.0.0</p>
      </section>
    </main>
  );
}
