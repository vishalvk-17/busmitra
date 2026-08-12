import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import TrackBus from "../pages/TrackBus/TrackBus";
import RoutesPage from "../pages/Routes/Routes";
import BusDetails from "../pages/BusDetails/BusDetails";
import Profile from "../pages/Profile/Profile";
import Contact from "../pages/Contact/Contact";
import About from "../pages/About/About";
import NotFound from "../pages/NotFound/NotFound";
import SearchBus from "../pages/Search/SearchBus";
import RouteDetails from "../pages/RouteDetails";
import Favorites from "../pages/Favorites/Favorites";
import Notifications from "../pages/Notifications/Notifications";
import OperatorLogin from "../pages/OperatorLogin/OperatorLogin";
import OperatorDashboard from "../pages/OperatorDashboard/OperatorDashboard";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import PassengerDashboard from "../pages/PassengerDashboard/PassengerDashboard";
import DriverLogin from "../pages/DriverLogin/DriverLogin";
import DriverDashboard from "../pages/DriverDashboard/DriverDashboard";
import Settings from "../pages/Settings/Settings";
import Privacy from "../pages/Privacy/Privacy";
import Terms from "../pages/Terms/Terms";
import NearbyBuses from "../pages/NearbyBuses/NearbyBuses";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/operator/login"
          element={<OperatorLogin />}
        />

        <Route
          path="/operator/dashboard"
          element={<OperatorDashboard />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/dashboard" element={<PassengerDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/driver/login" element={<DriverLogin />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Passenger */}
        <Route
          path="/search-bus"
          element={<SearchBus />}
        />

        <Route
          path="/track-bus"
          element={<TrackBus />}
        />

        <Route path="/nearby-buses" element={<NearbyBuses />} />

        <Route
          path="/routes"
          element={<RoutesPage />}
        />

        <Route
          path="/bus/:id"
          element={<BusDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

        <Route
          path="/route/:id"
          element={<RouteDetails />}
        />

        <Route
          path="/favorites"
          element={<Favorites />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
