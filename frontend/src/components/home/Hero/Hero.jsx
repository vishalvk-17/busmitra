import "./Hero.css";

import {
  FaArrowRight,
  FaPlayCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

import heroImage from "../../../assets/images/hero-image.png";
import usersImage from "../../../assets/images/users.png";
import { Link } from "react-router-dom";

function Hero({
  form,
  error,
  handleChange,
  handleSubmit,
}) {
  return (
    <section className="hero">
      <div className="container hero-container">

        {/* LEFT */}
        <div className="hero-left">

          <div className="hero-badge">
            <span className="badge-dot"></span>

            <span>
              Live Tracking • Trusted by Thousands
            </span>
          </div>

          <h1>
            Har Bus Ki Location,
            <br />

            <span>
              Ab Aapke Haath Mein.
            </span>
          </h1>

          <p>
            Bus Mitra se aap kisi bhi private ya
            rural bus ki live location dekh sakte hain
            aur jaan sakte hain ki bus aapke stop tak
            kab pahunchne wali hai.
          </p>

          {/* SEARCH CARD */}
          <div className="hero-search-card">

            <div className="search-input-group">

              <FaMapMarkerAlt />

              <div>
                <label>
                  From
                </label>

                <input
                  type="text"
                  name="origin"
                  value={form?.origin || ""}
                  onChange={handleChange}
                  placeholder="Departure city"
                />
              </div>

            </div>

            <div className="search-divider"></div>

            <div className="search-input-group">

              <FaMapMarkerAlt />

              <div>
                <label>
                  To
                </label>

                <input
                  type="text"
                  name="destination"
                  value={
                    form?.destination || ""
                  }
                  onChange={handleChange}
                  placeholder="Destination city"
                />
              </div>

            </div>

            <div className="search-divider"></div>

            <div className="search-input-group">

              <FaCalendarAlt />

              <div>
                <label>
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={form?.date || ""}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button
              type="button"
              className="hero-search-btn"
              onClick={handleSubmit}
            >
              Search
              <FaArrowRight />
            </button>

          </div>

          {error && (
            <p className="hero-search-error">
              {error}
            </p>
          )}

          {/* BUTTONS */}
          <div className="hero-buttons">

            <button
              className="primary-btn"
              type="button"
              onClick={handleSubmit}
            >
              Track Your Bus

              <FaArrowRight />
            </button>

            <Link
              to="/register"
              className="secondary-btn signup-hero-btn"
            >
              Create Free Account
            </Link>

            <button
              className="secondary-btn"
              type="button"
            >
              <FaPlayCircle />

              How It Works
            </button>

          </div>

          {/* USERS */}
          <div className="hero-users">

            <img
              src={usersImage}
              alt="Bus Mitra users"
            />

            <p>
              <strong>
                10,000+
              </strong>{" "}
              users tracking buses daily 👋
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="hero-right">

          <img
            src={heroImage}
            alt="Bus Mitra Hero"
            className="hero-image"
          />

        </div>

      </div>
    </section>
  );
}

export default Hero;
