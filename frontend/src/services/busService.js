import api from "./api";

const getBuses = async (params = {}) => {
  const response = await api.get("/buses", {
    params,
  });

  return response.data;
};

const getBusById = async (busId) => {
  const response = await api.get(
    `/buses/${busId}`
  );

  return response.data;
};

const createBus = async (busData) => {
  const response = await api.post(
    "/buses",
    busData
  );

  return response.data;
};

const updateBus = async (busId, busData) => {
  const response = await api.put(
    `/buses/${busId}`,
    busData
  );

  return response.data;
};

const deleteBus = async (busId) => {
  const response = await api.delete(
    `/buses/${busId}`
  );

  return response.data;
};

export default {
  getBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
};