const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middlewares/auth");

// Get notifications for logged-in user
router.get("/", authMiddleware, async (req, res) => {
   try {
      const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(notifs);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

// Mark a notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
   try {
      const notif = await Notification.findByIdAndUpdate(
         req.params.id,
         { readAt: new Date() },
         { new: true }
      );
      res.json(notif);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

module.exports = router;
