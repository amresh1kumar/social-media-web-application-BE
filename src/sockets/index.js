module.exports = (io) => {
   io.on("connection", (socket) => {
      console.log("A user connected");

      // Join rooms for conversations + notifications
      socket.on("join", ({ userId }) => {
         socket.join(userId);           // conversation room
         socket.join("notif_" + userId); // notification room
      });

      // Send message
      socket.on("send_message", async ({ toConversationId, text, senderId }) => {
         const Conversation = require("../models/Conversation");
         const User = require("../models/User");
         const Notification = require("../models/Notification");

         const conv = await Conversation.findById(toConversationId);
         if (!conv) return;

         const message = { sender: senderId, text };
         conv.messages.push(message);
         conv.updatedAt = new Date();
         await conv.save();

         // Populate sender username
         const fullMsg = await conv.populate("messages.sender", "username");
         const newMessage = fullMsg.messages[fullMsg.messages.length - 1];

         // Emit message to all participants
         conv.participants.forEach(async (p) => {
            io.to(p.toString()).emit("receive_message", { ...newMessage._doc, conversationId: conv._id });

            // Send notification to others
            if (p.toString() !== senderId) {
               const sender = await User.findById(senderId);
               const notif = await Notification.create({
                  user: p,
                  type: "message",
                  message: `New message from ${sender.username}`
               });
               io.to("notif_" + p.toString()).emit("receiveNotification", notif);
            }
         });
      });

      socket.on("disconnect", () => {
         console.log("A user disconnected");
      });
   });
};
