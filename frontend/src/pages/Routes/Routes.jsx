import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import routeService from "../../services/routeService";

import "./Routes.css";

function RoutesPage() {
  const navigate = useNavigate();

  const [routes, setRoutes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ===================================================
  // FETCH ROUTES
  // ===================================================

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await routeService.getRoutes();

        setRoutes(
          data.routes || []
        );
      } catch (err) {
        console.error(
          "Routes Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load routes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // ===================================================
  // FILTER ROUTES
  // ===================================================

  const filteredRoutes =
    routes.filter((route) => {
      const searchText =
        search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      return (
        route.origin
          ?.toLowerCase()
          .includes(searchText) ||
        route.destination
          ?.toLowerCase()
          .includes(searchText) ||
        route.routeName
          ?.toLowerCase()
          .includes(searchText) ||
        route.routeNumber
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="routes-page">

        <div className="routes-container">

          <div className="routes-header">
            <h1>
              All Routes
            </h1>
          </div>

          <div className="routes-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading routes...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <div className="routes-page">

        <div className="routes-container">

          <div className="routes-error">

            <h2>
              Unable to load routes
            </h2>

            <p>
              {error}
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="routes-page">

      <div className="routes-container">

        {/* =============================================
            HEADER
        ============================================= */}

        <div className="routes-header">

          <div>

            <span className="routes-label">
              Bus Mitra
            </span>

            <h1>
              All Bus Routes
            </h1>

            <p>
              Explore bus routes and find
              the best way to reach your
              destination.
            </p>

          </div>

          <div className="routes-count">

            <strong>
              {routes.length}
            </strong>

            <span>
              Routes
            </span>

          </div>

        </div>


        {/* =============================================
            SEARCH
        ============================================= */}

        <div className="routes-search">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by city, route or route number..."
          />

        </div>


        {/* =============================================
            EMPTY
        ============================================= */}

        {filteredRoutes.length ===
          0 && (

          <div className="routes-empty">

            <h2>
              No routes found
            </h2>

            <p>
              Try searching for another
              city or route.
            </p>

          </div>
        )}


        {/* =============================================
            ROUTE CARDS
        ============================================= */}

        {filteredRoutes.length >
          0 && (

          <div className="routes-grid">

            {filteredRoutes.map(
              (route) => {

                const liveBusCount =
                  route.buses?.filter(
                    (bus) =>
                      bus.liveTracking
                  ).length || 0;

                return (
                  <div
                    className="route-card"
                    key={route._id}
                  >

                    {/* Route Number */}

                    <div className="route-card-top">

                      <div>

                        {route.routeNumber && (
                          <span className="route-number">
                            {
                              route.routeNumber
                            }
                          </span>
                        )}

                        <h2>
                          {route.origin}
                          {" → "}
                          {
                            route.destination
                          }
                        </h2>

                      </div>

                      {liveBusCount >
                        0 && (
                        <span className="route-live">
                          ● {liveBusCount} Live
                        </span>
                      )}

                    </div>


                    {/* Route Name */}

                    {route.routeName && (
                      <p className="route-name">
                        {route.routeName}
                      </p>
                    )}


                    {/* Info */}

                    <div className="route-card-info">

                      <div>

                        <span>
                          Stops
                        </span>

                        <strong>
                          {route.stops
                            ?.length ||
                            0}
                        </strong>

                      </div>


                      <div>

                        <span>
                          Distance
                        </span>

                        <strong>
                          {route.distanceKm ??
                            "—"}{" "}
                          km
                        </strong>

                      </div>


                      <div>

                        <span>
                          Fare
                        </span>

                        <strong>
                          ₹
                          {route.fare ??
                            "—"}
                        </strong>

                      </div>

                    </div>


                    {/* Action */}

                    <button
                      className="route-view-btn"
                      onClick={() =>
                        navigate(
                          `/route/${route._id}`
                        )
                      }
                    >
                      View Route
                      <span>
                        →
                      </span>
                    </button>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default RoutesPage;