import api from "./api";

const sendLocation = async (
  tripId,
  location
) => {
  const response = await api.post(
    `/live-location/${tripId}`,
    {
      latitude: location.latitude,
      longitude: location.longitude,
      speed: location.speed || 0,
      heading: location.heading || 0,
      accuracy: location.accuracy || null,
    }
  );

  return response.data;
};

export const getCurrentLocation = () => {
  return new Promise(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,

            longitude:
              position.coords.longitude,

            speed:
              position.coords.speed || 0,

            heading:
              position.coords.heading || 0,

            accuracy:
              position.coords.accuracy || null,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,

          timeout: 10000,

          maximumAge: 5000,
        }
      );
    }
  );
};

export const watchLocation = (
  onLocation,
  onError
) => {
  if (!navigator.geolocation) {
    onError?.(
      new Error(
        "Geolocation is not supported."
      )
    );

    return null;
  }

  const watchId =
    navigator.geolocation.watchPosition(
      (position) => {
        onLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          speed:
            position.coords.speed || 0,

          heading:
            position.coords.heading || 0,

          accuracy:
            position.coords.accuracy || null,
        });
      },

      (error) => {
        onError?.(error);
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 3000,
      }
    );

  return watchId;
};

export const stopWatchingLocation = (
  watchId
) => {
  if (
    watchId !== null &&
    watchId !== undefined
  ) {
    navigator.geolocation.clearWatch(
      watchId
    );
  }
};

export default {
  sendLocation,
  getCurrentLocation,
  watchLocation,
  stopWatchingLocation,
};