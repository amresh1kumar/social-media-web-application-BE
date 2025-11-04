require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

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

const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);



const allowedOrigins = [
   "http://localhost:3000",
   "https://social-media-web-application-fe.onrender.com",
];

app.use(
   cors({
      origin: function (origin, callback) {
         // Agar request without origin (like Postman) ho, allow karo
         if (!origin) return callback(null, true);

         if (allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            callback(new Error("Not allowed by CORS"));
         }
      },
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
   })
);

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

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
   console.log(`Server running on port ${PORT}`);
});


