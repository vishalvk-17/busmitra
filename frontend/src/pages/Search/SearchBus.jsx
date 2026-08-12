import { useEffect, useState } from "react";


import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBell,
  FaBus,
  FaClock,
  FaHeart,
  FaHome,
  FaMapMarkerAlt,
  FaMicrophone,
  FaQrcode,
  FaSearch,
  FaTicketAlt,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";

import useBusSearch from "../../hooks/useBusSearch";
import "./SearchBus.css";

function SearchBus() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const origin =
    searchParams.get("origin") || "";

  const destination =
    searchParams.get("destination") || "";

  const date =
    searchParams.get("date") || "";

  const {
    routes,
    buses,
    trips,
    loading,
    error,
    searchBuses,
  } = useBusSearch();

  useEffect(() => {
    if (!origin || !destination) {
      return;
    }

    searchBuses({
      origin,
      destination,
      ...(date && { date }),
    });
  }, [
    origin,
    destination,
    date,
    searchBuses,
  ]);

  // =====================================================
  // BUS DETAILS
  // =====================================================

  const handleBusClick = (busId) => {
    if (!busId) {
      return;
    }

    navigate(`/bus/${busId}`);
  };

  // =====================================================
  // LIVE TRACKING
  // =====================================================

  const handleTrackBus = (tripId) => {
    if (!tripId) {
      return;
    }

    navigate(`/track-bus?trip=${tripId}`);
  };

  // =====================================================
  // SEARCH ANOTHER ROUTE
  // =====================================================

  const handleNewSearch = () => {
    navigate("/");
  };

  if (!origin || !destination) {
    return <SearchLanding navigate={navigate} />;
  }

  return (
    <div className="search-bus-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="search-bus-header">

        <h1>
          Search Bus
        </h1>

        {origin && destination && (
          <p>
            {origin} → {destination}

            {date && (
              <>
                {" • "}
                {date}
              </>
            )}
          </p>
        )}

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="search-loading">

          <p>
            Searching buses...
          </p>

        </div>
      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <div className="search-error">

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

          <button
            onClick={handleNewSearch}
          >
            Try Another Search
          </button>

        </div>
      )}


      {/* =================================================
          NO SEARCH PARAMETERS
      ================================================= */}

      {!loading &&
        !error &&
        (!origin || !destination) && (
          <div className="bus-not-found">

            <h2>
              Search for a Bus
            </h2>

            <p>
              Enter your starting point and
              destination to find available buses.
            </p>

            <button
              onClick={handleNewSearch}
            >
              Search Bus
            </button>

          </div>
        )}


      {/* =================================================
          NO BUS FOUND
      ================================================= */}

      {!loading &&
        !error &&
        origin &&
        destination &&
        trips.length === 0 &&
        buses.length === 0 && (

          <div className="bus-not-found">

            <h2>
              No buses found
            </h2>

            <p>
              We couldn't find any buses for
              this route.
            </p>

            <button
              onClick={handleNewSearch}
            >
              Search Another Route
            </button>

          </div>
        )}


      {/* =================================================
          TRIP RESULTS
      ================================================= */}

      {!loading &&
        !error &&
        trips.length > 0 && (

          <div className="search-results">

            {/* Results Summary */}

            <div className="results-summary">

              <div>
                <h2>
                  Available Buses
                </h2>

                <p>
                  {trips.length} trip
                  {trips.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

            </div>


            {/* Bus Cards */}

            <div className="bus-results">

              {trips.map((trip) => {

                const bus =
                  trip.bus;

                const route =
                  trip.route;

                const driver =
                  trip.driver;

                const isLive =
                  trip.status ===
                  "running";

                return (
                  <div
                    className="bus-result-card"
                    key={trip._id}
                  >

                    {/* =================================
                        TOP
                    ================================= */}

                    <div className="bus-result-main">

                      <div>

                        <h3>
                          {bus?.busNumber ||
                            "Bus"}
                        </h3>

                        <p>
                          {bus
                            ?.registrationNumber ||
                            "Registration unavailable"}
                        </p>

                      </div>


                      <span
                        className={`trip-status ${trip.status}`}
                      >
                        {isLive
                          ? "LIVE"
                          : trip.status}
                      </span>

                    </div>


                    {/* =================================
                        ROUTE
                    ================================= */}

                    <div className="bus-route">

                      <span>
                        {route?.origin ||
                          origin}
                      </span>

                      <span>
                        →
                      </span>

                      <span>
                        {route
                          ?.destination ||
                          destination}
                      </span>

                    </div>


                    {/* =================================
                        BUS INFORMATION
                    ================================= */}

                    <div className="bus-result-info">

                      <div>

                        <small>
                          Bus Type
                        </small>

                        <strong>
                          {bus?.busType ||
                            "Ordinary"}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Fare
                        </small>

                        <strong>
                          ₹
                          {route?.fare ??
                            "—"}
                        </strong>

                      </div>


                      <div>

                        <small>
                          Driver
                        </small>

                        <strong>
                          {driver?.name ||
                            "Assigned"}
                        </strong>

                      </div>

                    </div>


                    {/* =================================
                        TRIP TIME
                    ================================= */}

                    {trip.scheduledStartTime && (
                      <div className="trip-time">

                        <small>
                          Departure
                        </small>

                        <strong>
                          {new Date(
                            trip.scheduledStartTime
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </strong>

                      </div>
                    )}


                    {/* =================================
                        ACTIONS
                    ================================= */}

                    <div className="bus-card-actions">

                      {/* Bus Details */}

                      <button
                        type="button"
                        className="view-bus-btn"
                        onClick={() =>
                          handleBusClick(
                            bus?._id
                          )
                        }
                        disabled={
                          !bus?._id
                        }
                      >
                        View Bus
                      </button>


                      {/* Live Tracking */}

                      {isLive && (
                        <button
                          type="button"
                          className="track-bus-btn"
                          onClick={() =>
                            handleTrackBus(
                              trip._id
                            )
                          }
                        >
                          Track Live
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          </div>
        )}


      {/* =================================================
          BUSES WITHOUT TRIPS
      ================================================= */}

      {!loading &&
        !error &&
        trips.length === 0 &&
        buses.length > 0 && (

          <div className="search-results">

            <div className="results-summary">

              <h2>
                Available Buses
              </h2>

              <p>
                {buses.length} bus
                {buses.length !== 1
                  ? "es"
                  : ""}{" "}
                found
              </p>

            </div>


            <div className="bus-results">

              {buses.map((bus) => (

                <div
                  className="bus-result-card"
                  key={bus._id}
                >

                  <div className="bus-result-main">

                    <div>

                      <h3>
                        {bus.busNumber}
                      </h3>

                      <p>
                        {
                          bus.registrationNumber
                        }
                      </p>

                    </div>

                    <span
                      className={`trip-status ${
                        bus.status
                      }`}
                    >
                      {bus.status}
                    </span>

                  </div>


                  <div className="bus-result-info">

                    <div>

                      <small>
                        Bus Type
                      </small>

                      <strong>
                        {bus.busType ||
                          "Ordinary"}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Total Seats
                      </small>

                      <strong>
                        {bus.totalSeats ??
                          "—"}
                      </strong>

                    </div>


                    <div>

                      <small>
                        Available Seats
                      </small>

                      <strong>
                        {bus.availableSeats ??
                          "—"}
                      </strong>

                    </div>

                  </div>


                  <div className="bus-card-actions">

                    <button
                      type="button"
                      className="view-bus-btn"
                      onClick={() =>
                        handleBusClick(
                          bus._id
                        )
                      }
                    >
                      View Bus
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>
        )}

    </div>
  );
}

export default SearchBus;

function SearchLanding({ navigate }) {
  const [form, setForm] = useState({ origin: "", destination: "" });
  const defaultRecent = [
    { origin: "Bhopal", destination: "Indore", bus: "MP 09 FA 1234 · Shiv Shakti Travels", live: true },
    { origin: "Indore", destination: "Ujjain", bus: "MP 13 PA 5678 · Patidar Travels" },
    { origin: "Bhopal", destination: "Jabalpur", bus: "MP 20 AB 7788 · Mahakal Travels" },
    { origin: "Indore", destination: "Bhopal", bus: "MP 09 FA 8899 · Royal Travels" },
  ];
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem("busMitraRecentSearches")) || defaultRecent; }
    catch { return defaultRecent; }
  });
  const search = (event) => {
    event?.preventDefault();
    const origin = form.origin.trim(); const destination = form.destination.trim();
    if (!origin || !destination) return;
    const next = [{ origin, destination, bus: "Recent search" }, ...recent.filter((item) => item.origin !== origin || item.destination !== destination)].slice(0, 4);
    setRecent(next); localStorage.setItem("busMitraRecentSearches", JSON.stringify(next));
    navigate(`/search-bus?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  };
  const routeSearch = (origin, destination) => navigate(`/search-bus?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
  const popular = [["Bhopal", "Indore", "32"], ["Indore", "Ujjain", "18"], ["Bhopal", "Jabalpur", "24"], ["Indore", "Bhopal", "28"]];
  return <main className="search-landing-page">
    <header className="search-topbar"><button onClick={() => navigate(-1)} aria-label="Back"><FaArrowLeft /></button><div className="search-brand"><span><FaBus /></span><strong>Bus <em>Mitra</em></strong></div><div><button aria-label="Notifications"><FaBell /></button><FaUserCircle /></div></header>
    <section className="search-landing-heading"><div><h1>Search Your Bus</h1><p>Find any bus, route or city and track it live</p></div><div className="search-illustration"><FaBus /><FaMapMarkerAlt /></div></section>
    <form className="search-landing-form" onSubmit={search}>
      <label><span>From</span><div><i className="from-dot" /><input value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="Enter source" /></div></label>
      <button type="button" className="swap-search" onClick={() => setForm({ origin: form.destination, destination: form.origin })}>↔</button>
      <label><span>To</span><div><i className="to-dot" /><input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Enter destination" /></div></label>
      <button className="landing-search-button"><FaSearch /> Search</button>
      <div className="search-utility-row"><button type="button" onClick={() => navigator.geolocation?.getCurrentPosition(() => alert("Location detected. Enter your destination to search."))}><FaMapMarkerAlt /> Use My Location</button><button type="button"><FaMicrophone /> Voice Search</button><button type="button"><FaQrcode /> Scan Bus QR</button></div>
    </form>
    <section className="search-surface recent-surface"><header><h2>Recent Searches</h2><button onClick={() => { setRecent([]); localStorage.removeItem("busMitraRecentSearches"); }}>Clear All</button></header>{recent.length ? recent.map((item, index) => <article key={`${item.origin}-${item.destination}-${index}`}><button className="recent-main" onClick={() => routeSearch(item.origin, item.destination)}><FaClock /><div><strong>{item.origin} <FaArrowRight /> {item.destination}</strong><span>{item.bus}</span></div></button>{item.live && <em>● Live</em>}<button className="remove-recent" onClick={() => setRecent(recent.filter((_, itemIndex) => itemIndex !== index))}><FaTimes /></button></article>) : <p className="search-empty">No recent searches yet.</p>}<button className="view-history" onClick={() => navigate("/routes")}>View All History</button></section>
    <section className="popular-section"><header><h2>Popular Routes</h2><button onClick={() => navigate("/routes")}>View All Routes <FaArrowRight /></button></header><div className="popular-route-grid">{popular.map(([from, to, count], index) => <button key={`${from}-${to}`} onClick={() => routeSearch(from, to)}><span className={`route-icon route-${index}`}><FaMapMarkerAlt /></span><strong>{from}<br />↔ {to}</strong><small>{count} Buses Available</small><FaArrowRight /></button>)}</div></section>
    <section className="search-surface suggestions"><header><div><h2>✦ Suggested for You</h2><p>Based on your searches</p></div></header>{["Shiv Shakti Travels", "Patidar Travels", "Royal Travels"].map((travel, index) => <article key={travel}><FaBus className={`suggested-bus bus-${index}`} /><div><strong>Bhopal <FaArrowRight /> Indore</strong><span>{travel}</span></div><div><strong>{["11:20 AM", "12:00 PM", "12:30 PM"][index]}</strong><span>Departure</span></div><div className="eta"><strong>{18 + index * 2} min</strong><span>ETA</span></div><div className="fare"><strong>₹{220 - index * 10}</strong><span>Approx.</span></div><FaHeart /></article>)}<button className="view-history" onClick={() => routeSearch("Bhopal", "Indore")}>View More Buses</button></section>
    <nav className="search-bottom-nav"><button onClick={() => navigate("/")}><FaHome />Home</button><button className="active"><FaSearch />Search Bus</button><button onClick={() => navigate("/track-bus")}><FaMapMarkerAlt />Track Bus</button><button><FaTicketAlt />My Bookings</button><button onClick={() => navigate("/profile")}><FaUserCircle />Profile</button></nav>
  </main>;
}
