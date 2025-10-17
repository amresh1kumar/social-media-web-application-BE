const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const authMiddleware = require("../middlewares/auth");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management routes
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
   try {
      const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
      res.json(notifs);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Notification ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       500:
 *         description: Server error
 */
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

