import api from "./api";

// =====================================================
// GET ALL ROUTES
// =====================================================

const getRoutes = async (params = {}) => {
  const response = await api.get(
    "/routes",
    {
      params,
    }
  );

  return response.data;
};


// =====================================================
// GET ROUTE BY ID
// =====================================================

const getRouteById = async (
  routeId
) => {
  const response = await api.get(
    `/routes/${routeId}`
  );

  return response.data;
};


// =====================================================
// SEARCH ROUTES
// =====================================================

const searchRoutes = async (
  origin,
  destination
) => {
  const response = await api.get(
    "/routes",
    {
      params: {
        origin,
        destination,
      },
    }
  );

  return response.data;
};


// =====================================================
// CREATE ROUTE
// =====================================================

const createRoute = async (
  routeData
) => {
  const response = await api.post(
    "/routes",
    routeData
  );

  return response.data;
};


// =====================================================
// UPDATE ROUTE
// =====================================================

const updateRoute = async (
  routeId,
  routeData
) => {
  const response = await api.put(
    `/routes/${routeId}`,
    routeData
  );

  return response.data;
};


// =====================================================
// DELETE ROUTE
// =====================================================

const deleteRoute = async (
  routeId
) => {
  const response = await api.delete(
    `/routes/${routeId}`
  );

  return response.data;
};


export default {
  getRoutes,
  getRouteById,
  searchRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
};