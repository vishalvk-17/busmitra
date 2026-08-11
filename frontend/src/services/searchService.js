import api from "./api";

const searchBuses = async (params = {}) => {
  const response = await api.get(
    "/search/buses",
    {
      params,
    }
  );

  return response.data;
};

export default {
  searchBuses,
};