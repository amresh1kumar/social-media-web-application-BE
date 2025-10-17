const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");
const { deleteUser } = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management routes
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by username
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *           example: amresh
 *         required: true
 *         description: Username to search
 *     responses:
 *       200:
 *         description: User list fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/search", authMiddleware, async (req, res) => {
   try {
      const { username } = req.query;
      if (!username) {
         return res.status(400).json({ message: "Username query is required" });
      }

      const users = await User.find({
         username: { $regex: username, $options: "i" },
         _id: { $ne: req.user._id }
      }).select("_id username");

      if (!users || users.length === 0) {
         return res.status(404).json({ message: "User not found" });
      }

      res.json(users);
   } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
   try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
   try {
      if (req.user._id.toString() !== req.params.id) {
         return res.status(403).json({ message: "Unauthorized" });
      }

      const updates = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
      res.json(user);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user and related data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User and related data deleted successfully
 *       500:
 *         description: Server error
 */
router.delete("/:id", deleteUser);

module.exports = router;
