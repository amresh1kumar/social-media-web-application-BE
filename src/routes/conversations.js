// const express = require("express");
// const router = express.Router();
// const Conversation = require("../models/Conversation");
// const authMiddleware = require("../middlewares/auth");

// // Get all conversations for logged-in user
// router.get("/", authMiddleware, async (req, res) => {
//    const convs = await Conversation.find({ participants: req.user._id }).populate("participants", "username");
//    res.json(convs);
// });

// // Get messages for a specific conversation
// router.get("/:id/messages", authMiddleware, async (req, res) => {
//    const conv = await Conversation.findById(req.params.id).populate("messages.sender", "username");
//    if (!conv) return res.status(404).json({ message: "Conversation not found" });
//    res.json(conv.messages);
// });


// // Create new conversation
// router.post("/", authMiddleware, async (req, res) => {
//    const { participantIds } = req.body; // array of user IDs
//    if (!participantIds || !participantIds.length) {
//       return res.status(400).json({ message: "Participants required" });
//    }

//    // Include logged-in user
//    const participants = [...new Set([...participantIds, req.user._id])];

//    // Check if conversation already exists
//    const existing = await Conversation.findOne({
//       participants: { $all: participants, $size: participants.length }
//    });

//    if (existing) return res.status(200).json(existing);

//    // Create new conversation
//    const conv = new Conversation({ participants });
//    await conv.save();
//    const fullConv = await conv.populate("participants", "username");
//    res.status(201).json(fullConv);
// });

// module.exports = router;



const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const authMiddleware = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Chat and conversation routes
 */

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get all user conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
   const convs = await Conversation.find({ participants: req.user._id }).populate("participants", "username");
   res.json(convs);
});

/**
 * @swagger
 * /conversations/{id}/messages:
 *   get:
 *     summary: Get all messages for a specific conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Conversation ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Server error
 */
router.get("/:id/messages", authMiddleware, async (req, res) => {
   const conv = await Conversation.findById(req.params.id).populate("messages.sender", "username");
   if (!conv) return res.status(404).json({ message: "Conversation not found" });
   res.json(conv.messages);
});

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to include in the conversation
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       200:
 *         description: Conversation already exists
 *       400:
 *         description: Participants required
 *       500:
 *         description: Server error
 */
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
