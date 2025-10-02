module.exports = (io) => {
   io.on("connection", (socket) => {
      console.log("User connected for notifications");

      socket.on("joinNotifications", ({ userId }) => {
         socket.join("notif_" + userId); // separate room for notifications
      });

      socket.on("sendNotification", async ({ userId, type, message }) => {
         const Notification = require("../models/Notification");
         const notif = await Notification.create({ user: userId, type, message });

         // Emit to specific user room
         io.to("notif_" + userId).emit("receiveNotification", notif);
      });

      socket.on("disconnect", () => {
         console.log("User disconnected from notifications");
      });
   });
};
