import api from "./api";

const signup = async (userData) => {
  const response = await api.post(
    "/auth/signup",
    userData
  );

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("busMitraToken", token);
    localStorage.setItem(
      "busMitraUser",
      JSON.stringify(user)
    );
  }

  return response.data;
};

const login = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  const { token, user } = response.data;

  if (token) {
    localStorage.setItem("busMitraToken", token);
    localStorage.setItem(
      "busMitraUser",
      JSON.stringify(user)
    );
  }

  return response.data;
};

const getMe = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

const updateMe = async (profile) => {
  const response = await api.put("/auth/me", profile);
  localStorage.setItem("busMitraUser", JSON.stringify(response.data.user));
  return response.data;
};

const logout = () => {
  localStorage.removeItem("busMitraToken");
  localStorage.removeItem("busMitraUser");
};

const getStoredUser = () => {
  const user = localStorage.getItem(
    "busMitraUser"
  );

  return user ? JSON.parse(user) : null;
};

const getToken = () => {
  return localStorage.getItem("busMitraToken");
};

const authService = {
  signup,
  login,
  getMe,
  updateMe,
  logout,
  getStoredUser,
  getToken,
};

export default authService;
