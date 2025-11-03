require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const notificationRoutes = require("./routes/notifications");
const conversationRoutes = require("./routes/conversations");

// import Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../swagger");

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io); // ✅ Access io in REST routes



// Middlewares
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(
   cors({
      origin: "*", // ✅ sab allowed (testing)
      credentials: true,
   })
);

// app.use(
//    cors({
//       origin: ["https://social-media-web-application-fe.onrender.com"], // ✅ your frontend
//       methods: ["GET", "POST", "PUT", "DELETE"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//       credentials: true,
//    })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Needed for form-data
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Socket handlers
require("./sockets")(io);               // conversations/messages
require("./sockets/notifications")(io); // notifications

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
   .then(() => console.log("MongoDB connected"))
   .catch((err) => console.log("MongoDB error:", err));


// mongoose.connect(process.env.MONGO_URI)
//    .then(() => {
//       console.log("✅ MongoDB connected successfully");
//       console.log("Connected to DB URI:", process.env.MONGO_URI);
//    })
//    .catch((err) => console.log("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.listen(PORT, "0.0.0.0", () => {
   console.log(`Server running on port ${PORT}`);
});


