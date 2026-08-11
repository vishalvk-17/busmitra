import { useEffect } from "react";


import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

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