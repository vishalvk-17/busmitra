const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const busRoutes = require("./routes/busRoutes");
const routeRoutes = require("./routes/routeRoutes");
const stopRoutes = require("./routes/stopRoutes");
const tripRoutes = require("./routes/tripRoutes");
const liveLocationRoutes = require("./routes/liveLocationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supportRoutes = require("./routes/supportRoutes");
const driverRoutes = require("./routes/driverRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://busmitra-nine.vercel.app/",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);
app.use("/api/operators", operatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/buses", busRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/stops", stopRoutes);
app.use("/api/trips", tripRoutes);
app.use(
  "/api/live-location",
  liveLocationRoutes
);
app.use("/api/search", searchRoutes);
app.use(
  "/api/favorites",
  favoriteRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Bus Mitra API is running",
  });
});

// =====================================================
// HTTP SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin:
      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Driver joins trip room
  socket.on("join-trip", (tripId) => {
    socket.join(`trip:${tripId}`);

    console.log(
      `Socket ${socket.id} joined trip:${tripId}`
    );
  });

  // passenger joins-user room
  socket.on("join-user", (userId) => {
        if (!userId) {
          return;
        }
        socket.join(
          `user:${userId}`
        );
      }
  );

  // Passenger joins trip room
  socket.on("track-trip", (tripId) => {
    socket.join(`trip:${tripId}`);

    console.log(
      `Passenger ${socket.id} tracking trip:${tripId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});



// =====================================================
// START SERVER
// =====================================================

server.listen(PORT, () => {
  console.log(
    `Bus Mitra server running on port ${PORT}`
  );

  console.log(
    `Socket.IO running on port ${PORT}`
  );
});
