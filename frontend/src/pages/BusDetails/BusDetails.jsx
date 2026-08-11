import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import busService from "../../services/busService";

import favoriteService from "../../services/favoriteService";

import "./BusDetails.css";

function BusDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  // =====================================================
  // BUS STATE
  // =====================================================

  const [bus, setBus] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // FAVORITE STATE
  // =====================================================

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteId, setFavoriteId] =
    useState(null);

  const [
    favoriteLoading,
    setFavoriteLoading,
  ] = useState(false);


  // =====================================================
  // FETCH BUS
  // =====================================================

  useEffect(() => {
    const fetchBus = async () => {
      try {
        setLoading(true);

        setError("");

        const data =
          await busService.getBusById(id);

        setBus(data.bus);
      } catch (err) {
        console.error(
          "Bus Details Error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load bus details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBus();
    }
  }, [id]);


  // =====================================================
  // CHECK FAVORITE
  // =====================================================

  useEffect(() => {
    const checkBusFavorite =
      async () => {
        if (!id) {
          return;
        }

        try {
          const data =
            await favoriteService.checkFavorite(
              "bus",
              id
            );

          setIsFavorite(
            Boolean(data.isFavorite)
          );

          setFavoriteId(
            data.favoriteId || null
          );
        } catch (err) {
          /*
           * 401 is expected when
           * passenger is not logged in.
           */
          console.log(
            "Favorite check skipped"
          );
        }
      };

    checkBusFavorite();
  }, [id]);


  // =====================================================
  // FAVORITE HANDLER
  // =====================================================

  const handleFavorite = async () => {
    try {
      setFavoriteLoading(true);

      // -----------------------------------------------
      // REMOVE
      // -----------------------------------------------

      if (
        isFavorite &&
        favoriteId
      ) {
        await favoriteService.removeFavorite(
          favoriteId
        );

        setIsFavorite(false);

        setFavoriteId(null);

        return;
      }

      // -----------------------------------------------
      // ADD
      // -----------------------------------------------

      const data =
        await favoriteService.addFavorite({
          type: "bus",
          id,
        });

      setIsFavorite(true);

      setFavoriteId(
        data.favorite?._id || null
      );
    } catch (err) {
      console.error(
        "Favorite Error:",
        err
      );

      // Login required
      if (
        err.response?.status ===
        401
      ) {
        navigate("/login");
      }
    } finally {
      setFavoriteLoading(false);
    }
  };


  // =====================================================
  // TRACK BUS
  // =====================================================

  const handleTrackBus = () => {
    /*
     * Prefer activeTrip/currentTrip.
     * Do NOT use bus._id here because
     * live tracking belongs to a trip.
     */

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
      <div className="bus-details-page">

        <div className="bus-details-loading">

          <div className="loading-spinner"></div>

          <h2>
            Loading bus details...
          </h2>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR / NOT FOUND
  // =====================================================

  if (error || !bus) {
    return (
      <div className="bus-details-page">

        <div className="bus-details-error">

          <h2>
            Bus not found
          </h2>

          <p>
            {error ||
              "The requested bus could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/search-bus")
            }
          >
            Back to Search
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // ACTIVE TRIP
  // =====================================================

  const activeTrip =
    bus?.activeTrip ||
    bus?.currentTrip ||
    bus?.trip ||
    null;

  const hasLiveTrip =
    Boolean(
      bus.liveTracking &&
      activeTrip?._id
    );


  return (
    <div className="bus-details-page">

      <div className="bus-details-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bus-details-header">

          <button
            type="button"
            className="bus-back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </button>


          <div className="bus-details-title">

            <div>

              <span className="bus-details-label">
                Bus Details
              </span>

              <h1>
                {bus.busNumber}
              </h1>

              <p>
                {bus.registrationNumber}
              </p>

            </div>


            {/* FAVORITE */}

            <button
              type="button"
              className={`favorite-btn ${
                isFavorite
                  ? "favorite-active"
                  : ""
              }`}
              onClick={
                handleFavorite
              }
              disabled={
                favoriteLoading
              }
            >
              {isFavorite
                ? "★"
                : "☆"}

              {isFavorite
                ? " Favorited"
                : " Add Favorite"}
            </button>

          </div>

        </div>


        {/* =================================================
            BUS OVERVIEW
        ================================================= */}

        <div className="bus-overview-card">

          <div>

            <span>
              Bus Number
            </span>

            <strong>
              {bus.busNumber}
            </strong>

          </div>


          <div>

            <span>
              Registration
            </span>

            <strong>
              {bus.registrationNumber ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              Bus Type
            </span>

            <strong>
              {bus.busType ||
                "Ordinary"}
            </strong>

          </div>


          <div>

            <span>
              Total Seats
            </span>

            <strong>
              {bus.totalSeats ??
                "—"}
            </strong>

          </div>

        </div>


        {/* =================================================
            STATUS
        ================================================= */}

        <div className="bus-status-card">

          <div>

            <span>
              Status
            </span>

            <strong
              className={
                bus.status ===
                "active"
                  ? "status-active"
                  : ""
              }
            >
              {bus.status ||
                "Unknown"}
            </strong>

          </div>


          <div>

            <span>
              Live Tracking
            </span>

            <strong
              className={
                bus.liveTracking
                  ? "status-live"
                  : "status-offline"
              }
            >
              {bus.liveTracking
                ? "● Live"
                : "Offline"}
            </strong>

          </div>

        </div>


        {/* =================================================
            ACTIVE TRIP
        ================================================= */}

        {activeTrip && (
          <div className="bus-trip-card">

            <div>

              <span>
                Current Trip
              </span>

              <h2>
                {activeTrip
                  .route?.origin ||
                  "Origin"}

                {" → "}

                {activeTrip
                  .route?.destination ||
                  "Destination"}
              </h2>

            </div>


            <span
              className={`trip-status ${
                activeTrip.status
              }`}
            >
              {activeTrip.status}
            </span>

          </div>
        )}


        {/* =================================================
            DRIVER
        ================================================= */}

        {bus.driver && (
          <div className="bus-driver-card">

            <h2>
              Driver
            </h2>

            <p>
              {bus.driver.name}
            </p>

            {bus.driver.phone && (
              <p>
                {bus.driver.phone}
              </p>
            )}

          </div>
        )}


        {/* =================================================
            OPERATOR
        ================================================= */}

        {bus.operator && (
          <div className="bus-operator-card">

            <h2>
              Operator
            </h2>

            <p>
              {bus.operator.name}
            </p>

            {bus.operator.phone && (
              <p>
                {bus.operator.phone}
              </p>
            )}

          </div>
        )}


        {/* =================================================
            AMENITIES
        ================================================= */}

        {bus.amenities?.length >
          0 && (

          <div className="bus-amenities-card">

            <h2>
              Amenities
            </h2>

            <div className="amenities-list">

              {bus.amenities.map(
                (
                  amenity,
                  index
                ) => (
                  <span
                    key={index}
                  >
                    {amenity}
                  </span>
                )
              )}

            </div>

          </div>
        )}


        {/* =================================================
            CURRENT LOCATION
        ================================================= */}

        {bus.currentLocation
          ?.latitude &&
          bus.currentLocation
            ?.longitude && (

          <div className="bus-location-card">

            <h2>
              Current Location
            </h2>

            <p>
              {bus.currentLocation.latitude.toFixed(
                5
              )}
              {", "}
              {bus.currentLocation.longitude.toFixed(
                5
              )}
            </p>

            {bus.currentLocation
              .updatedAt && (
              <small>
                Updated{" "}
                {new Date(
                  bus.currentLocation.updatedAt
                ).toLocaleTimeString()}
              </small>
            )}

          </div>
        )}


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="bus-details-actions">

          {hasLiveTrip && (
            <button
              type="button"
              className="track-bus-btn"
              onClick={
                handleTrackBus
              }
            >
              🚌 Track This Bus Live
            </button>
          )}

          {!hasLiveTrip &&
            bus.liveTracking && (
              <div className="tracking-unavailable">
                <strong>
                  Live tracking is temporarily
                  unavailable.
                </strong>

                <span>
                  Please try again shortly.
                </span>
              </div>
            )}

        </div>

      </div>

    </div>
  );
}

export default BusDetails;