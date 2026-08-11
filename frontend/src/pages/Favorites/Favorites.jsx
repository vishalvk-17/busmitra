import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import favoriteService from "../../services/favoriteService";

import "./Favorites.css";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    removingId,
    setRemovingId,
  ] = useState(null);

  // =====================================================
  // FETCH FAVORITES
  // =====================================================

  useEffect(() => {
    const fetchFavorites =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await favoriteService.getFavorites();

          setFavorites(
            data.favorites || []
          );
        } catch (err) {
          console.error(
            "Favorites Error:",
            err
          );

          if (
            err.response?.status ===
            401
          ) {
            navigate("/login");
            return;
          }

          setError(
            err.response?.data?.message ||
              "Unable to load favorites"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchFavorites();
  }, [navigate]);

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const handleRemove = async (
    favoriteId
  ) => {
    try {
      setRemovingId(
        favoriteId
      );

      await favoriteService.removeFavorite(
        favoriteId
      );

      setFavorites(
        (current) =>
          current.filter(
            (favorite) =>
              favorite._id !==
              favoriteId
          )
      );
    } catch (err) {
      console.error(
        "Remove Favorite Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to remove favorite"
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // TRACK BUS
  // =====================================================

  const handleTrackBus = (
    favorite
  ) => {
    const bus =
      favorite.bus;

    const tripId =
      bus?.activeTrip?._id ||
      bus?.currentTrip?._id ||
      bus?.trip?._id;

    if (!tripId) {
      return;
    }

    navigate(
      `/track-bus?trip=${tripId}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="favorites-page">

        <div className="favorites-container">

          <div className="favorites-loading">

            <div className="loading-spinner"></div>

            <h2>
              Loading favorites...
            </h2>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="favorites-page">

        <div className="favorites-container">

          <div className="favorites-error">

            <h2>
              Unable to load favorites
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
    <div className="favorites-page">

      <div className="favorites-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="favorites-header">

          <div>

            <span className="favorites-label">
              Bus Mitra
            </span>

            <h1>
              My Favorites
            </h1>

            <p>
              Your saved buses and routes
              in one place.
            </p>

          </div>

          <div className="favorites-count">

            <strong>
              {favorites.length}
            </strong>

            <span>
              Saved
            </span>

          </div>

        </div>


        {/* =================================================
            EMPTY
        ================================================= */}

        {favorites.length ===
          0 && (

          <div className="favorites-empty">

            <div className="favorites-empty-icon">
              ☆
            </div>

            <h2>
              No favorites yet
            </h2>

            <p>
              Save your frequently used
              buses and routes for quick
              access.
            </p>

            <button
              onClick={() =>
                navigate("/routes")
              }
            >
              Explore Routes
            </button>

          </div>
        )}


        {/* =================================================
            FAVORITES
        ================================================= */}

        {favorites.length >
          0 && (

          <div className="favorites-grid">

            {favorites.map(
              (favorite) => {

                // =======================================
                // BUS
                // =======================================

                if (
                  favorite.type ===
                  "bus"
                ) {
                  const bus =
                    favorite.bus;

                  if (!bus) {
                    return null;
                  }

                  const hasLiveTrip =
                    Boolean(
                      bus.liveTracking &&
                      (
                        bus.activeTrip?._id ||
                        bus.currentTrip?._id ||
                        bus.trip?._id
                      )
                    );

                  return (
                    <div
                      className="favorite-card"
                      key={
                        favorite._id
                      }
                    >

                      <div className="favorite-card-header">

                        <div>

                          <span className="favorite-type">
                            BUS
                          </span>

                          <h2>
                            {
                              bus.busNumber
                            }
                          </h2>

                          <p>
                            {
                              bus.registrationNumber
                            }
                          </p>

                        </div>

                        <span
                          className={
                            bus.liveTracking
                              ? "favorite-live"
                              : "favorite-offline"
                          }
                        >
                          {bus.liveTracking
                            ? "● LIVE"
                            : "OFFLINE"}
                        </span>

                      </div>


                      <div className="favorite-info">

                        <div>

                          <span>
                            Type
                          </span>

                          <strong>
                            {
                              bus.busType ||
                              "Ordinary"
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Status
                          </span>

                          <strong>
                            {
                              bus.status ||
                              "Unknown"
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="favorite-actions">

                        <button
                          className="favorite-view-btn"
                          onClick={() =>
                            navigate(
                              `/bus/${bus._id}`
                            )
                          }
                        >
                          View Bus
                        </button>


                        {hasLiveTrip && (
                          <button
                            className="favorite-track-btn"
                            onClick={() =>
                              handleTrackBus(
                                favorite
                              )
                            }
                          >
                            Track Live
                          </button>
                        )}


                        <button
                          className="favorite-remove-btn"
                          disabled={
                            removingId ===
                            favorite._id
                          }
                          onClick={() =>
                            handleRemove(
                              favorite._id
                            )
                          }
                        >
                          {removingId ===
                          favorite._id
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>
                  );
                }


                // =======================================
                // ROUTE
                // =======================================

                if (
                  favorite.type ===
                  "route"
                ) {
                  const route =
                    favorite.route;

                  if (!route) {
                    return null;
                  }

                  return (
                    <div
                      className="favorite-card"
                      key={
                        favorite._id
                      }
                    >

                      <div className="favorite-card-header">

                        <div>

                          <span className="favorite-type">
                            ROUTE
                          </span>

                          <h2>
                            {route.origin}
                            {" → "}
                            {
                              route.destination
                            }
                          </h2>

                          {route.routeName && (
                            <p>
                              {
                                route.routeName
                              }
                            </p>
                          )}

                        </div>

                        {route.routeNumber && (
                          <span className="favorite-route-number">
                            {
                              route.routeNumber
                            }
                          </span>
                        )}

                      </div>


                      <div className="favorite-info">

                        <div>

                          <span>
                            Distance
                          </span>

                          <strong>
                            {
                              route.distanceKm ??
                              "—"
                            }{" "}
                            km
                          </strong>

                        </div>


                        <div>

                          <span>
                            Fare
                          </span>

                          <strong>
                            ₹
                            {
                              route.fare ??
                              "—"
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="favorite-actions">

                        <button
                          className="favorite-view-btn"
                          onClick={() =>
                            navigate(
                              `/route/${route._id}`
                            )
                          }
                        >
                          View Route
                        </button>


                        <button
                          className="favorite-remove-btn"
                          disabled={
                            removingId ===
                            favorite._id
                          }
                          onClick={() =>
                            handleRemove(
                              favorite._id
                            )
                          }
                        >
                          {removingId ===
                          favorite._id
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>
                  );
                }

                return null;
              }
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default Favorites;