const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   type: { type: String, enum: ["message", "like", "comment"], required: true },
   message: { type: String, required: true },
   readAt: { type: Date, default: null },
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
