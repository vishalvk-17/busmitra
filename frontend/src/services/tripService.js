import api from "./api";

const getTrips = async (params = {}) => {
  const response = await api.get("/trips", {
    params,
  });

  return response.data;
};

const getTripById = async (tripId) => {
  const response = await api.get(
    `/trips/${tripId}`
  );

  return response.data;
};

const createTrip = async (tripData) => {
  const response = await api.post(
    "/trips",
    tripData
  );

  return response.data;
};

const startTrip = async (tripId) => {
  const response = await api.put(
    `/trips/${tripId}/start`
  );

  return response.data;
};

const endTrip = async (tripId) => {
  const response = await api.put(
    `/trips/${tripId}/end`
  );

  return response.data;
};

const cancelTrip = async (tripId) => {
  const response = await api.put(
    `/trips/${tripId}/cancel`
  );

  return response.data;
};

export default {
  getTrips,
  getTripById,
  createTrip,
  startTrip,
  endTrip,
  cancelTrip,
};