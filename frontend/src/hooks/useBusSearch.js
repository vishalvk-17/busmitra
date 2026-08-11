import {
  useCallback,
  useState,
} from "react";

import searchService from "../services/searchService";

const useBusSearch = () => {
  const [results, setResults] = useState({
    routes: [],
    buses: [],
    trips: [],
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const searchBuses = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError("");

        const data =
          await searchService.searchBuses(
            params
          );

        setResults({
          routes: data.routes || [],
          buses: data.buses || [],
          trips: data.trips || [],
        });

        return data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Unable to search buses";

        setError(message);

        setResults({
          routes: [],
          buses: [],
          trips: [],
        });

        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    ...results,
    loading,
    error,
    searchBuses,
  };
};

export default useBusSearch;