const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const authMiddleware = require("../middlewares/auth");

// Get all conversations for logged-in user
router.get("/", authMiddleware, async (req, res) => {
   const convs = await Conversation.find({ participants: req.user._id }).populate("participants", "username");
   res.json(convs);
});

// Get messages for a specific conversation
router.get("/:id/messages", authMiddleware, async (req, res) => {
   const conv = await Conversation.findById(req.params.id).populate("messages.sender", "username");
   if (!conv) return res.status(404).json({ message: "Conversation not found" });
   res.json(conv.messages);
});


// Create new conversation
router.post("/", authMiddleware, async (req, res) => {
   const { participantIds } = req.body; // array of user IDs
   if (!participantIds || !participantIds.length) {
      return res.status(400).json({ message: "Participants required" });
   }

   // Include logged-in user
   const participants = [...new Set([...participantIds, req.user._id])];

   // Check if conversation already exists
   const existing = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length }
   });

   if (existing) return res.status(200).json(existing);

   // Create new conversation
   const conv = new Conversation({ participants });
   await conv.save();
   const fullConv = await conv.populate("participants", "username");
   res.status(201).json(fullConv);
});

module.exports = router;
