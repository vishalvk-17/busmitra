import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import driverLocationService from "../services/driverLocationService";
import useDriverLocation from "../../hooks/useDriverLocation";

const useDriverLocation = (
  tripId,
  enabled = false
) => {
  const [location, setLocation] =
    useState(null);

  const [tracking, setTracking] =
    useState(false);

  const [error, setError] =
    useState("");

  const watchIdRef =
    useRef(null);

  const sendingRef =
    useRef(false);

  const handleLocation = useCallback(
    async (newLocation) => {
      setLocation(newLocation);

      if (!tripId) {
        return;
      }

      // Prevent overlapping API requests
      if (sendingRef.current) {
        return;
      }

      try {
        sendingRef.current = true;

        await driverLocationService.sendLocation(
          tripId,
          newLocation
        );

        setError("");
      } catch (err) {
        console.error(
          "GPS upload error:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to send location"
        );
      } finally {
        sendingRef.current = false;
      }
    },
    [tripId]
  );

  const handleError = useCallback(
    (gpsError) => {
      console.error(
        "GPS Error:",
        gpsError
      );

      let message =
        "Unable to access your location.";

      if (gpsError.code === 1) {
        message =
          "Location permission denied.";
      }

      if (gpsError.code === 2) {
        message =
          "Current location is unavailable.";
      }

      if (gpsError.code === 3) {
        message =
          "Location request timed out.";
      }

      setError(message);

      setTracking(false);
    },
    []
  );

  const startTracking = useCallback(() => {
    if (!tripId) {
      setError(
        "Trip ID is required."
      );

      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setError("");

    const watchId =
      driverLocationService.watchLocation(
        handleLocation,
        handleError
      );

    watchIdRef.current = watchId;

    setTracking(true);
  }, [
    tripId,
    handleLocation,
    handleError,
  ]);

  const stopTracking = useCallback(() => {
    driverLocationService.stopWatchingLocation(
      watchIdRef.current
    );

    watchIdRef.current = null;

    setTracking(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    startTracking();

    return () => {
      stopTracking();
    };
  }, [
    enabled,
    startTracking,
    stopTracking,
  ]);

  return {
    location,
    tracking,
    error,
    startTracking,
    stopTracking,
  };
};

export default useDriverLocation;