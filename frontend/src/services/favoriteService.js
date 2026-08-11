import api from "./api";

// =====================================================
// GET FAVORITES
// =====================================================

const getFavorites = async () => {
  const response =
    await api.get("/favorites");

  return response.data;
};


// =====================================================
// ADD FAVORITE
// =====================================================

const addFavorite = async ({
  type,
  id,
}) => {
  const response =
    await api.post(
      "/favorites",
      {
        type,

        ...(type === "bus"
          ? { busId: id }
          : { routeId: id }),
      }
    );

  return response.data;
};


// =====================================================
// REMOVE FAVORITE
// =====================================================

const removeFavorite = async (
  favoriteId
) => {
  const response =
    await api.delete(
      `/favorites/${favoriteId}`
    );

  return response.data;
};


// =====================================================
// CHECK FAVORITE
// =====================================================

const checkFavorite = async (
  type,
  id
) => {
  const response =
    await api.get(
      `/favorites/check/${type}/${id}`
    );

  return response.data;
};


export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
};