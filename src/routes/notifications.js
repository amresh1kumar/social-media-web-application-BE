// // backend/src/routes/notifications.js
// const express = require("express");
// const router = express.Router();
// const Notification = require("../models/Notification");
// const authMiddleware = require("../middlewares/auth");

// // Get all notifications for logged-in user
// router.get("/", authMiddleware, async (req, res) => {
//    try {
//       const notifications = await Notification.find({ user: req.user._id })
//          .populate("actor", "username avatar")
//          .sort({ createdAt: -1 });
//       res.json(notifications);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });

// // Mark notification as read
// router.post("/:id/read", authMiddleware, async (req, res) => {
//    try {
//       const notif = await Notification.findById(req.params.id);
//       if (!notif) return res.status(404).json({ message: "Notification not found" });
//       if (notif.user.toString() !== req.user._id.toString())
//          return res.status(403).json({ message: "Unauthorized" });

//       notif.read = true;
//       await notif.save();
//       res.json(notif);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });

// module.exports = router;

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
