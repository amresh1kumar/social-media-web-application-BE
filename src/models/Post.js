const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   text: String,
   createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
   author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   content: String,
   image: String,
   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
   comments: [commentSchema],
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);
