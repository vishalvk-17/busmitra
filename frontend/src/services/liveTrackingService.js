import api from "./api";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const getLatestLocation = async (tripId) => {
  const response = await api.get(`/live-location/${tripId}/latest`);
  return response.data;
};

const getNearbyBuses = async ({ latitude, longitude, radius = 10 }) => {
  const response = await api.get("/live-location/nearby", { params: { latitude, longitude, radius } });
  return response.data;
};

const createSocket = () => io(SOCKET_URL, { transports: ["websocket"] });
const joinTrip = (socket, tripId) => socket.emit("track-trip", tripId);
const joinDriverTrip = (socket, tripId) => socket.emit("join-trip", tripId);

export default { getLatestLocation, getNearbyBuses, createSocket, joinTrip, joinDriverTrip };
