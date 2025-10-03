const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");
const { deleteUser } = require("../controllers/authController");

// 🔍 Search users (must be ABOVE /:id)
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

// 👤 Get user profile
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

// ✏️ Update user profile
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


// DELETE user
router.delete("/:id", deleteUser);
module.exports = router;
