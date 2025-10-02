const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   text: String,
   createdAt: { type: Date, default: Date.now }
});

const convSchema = new mongoose.Schema({
   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
   messages: [messageSchema],
   updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", convSchema);
