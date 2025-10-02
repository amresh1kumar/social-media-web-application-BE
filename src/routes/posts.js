// backend/src/routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/auth");
const Post = require("../models/Post");

// ---------------- Multer setup ----------------
const storage = multer.diskStorage({
   destination: (req, file, cb) => cb(null, "uploads/"),
   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ---------------- Create post ----------------
// router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
//    try {
//       const { content } = req.body;
//       const image = req.file ? req.file.filename : null;

//       const post = await Post.create({
//          author: req.user._id,
//          content,
//          image,
//       });

//       res.status(201).json(post);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });


// ---------------- Create post ----------------
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
   try {
      const { content } = req.body;
      const image = req.file ? req.file.filename : null;

      let post = await Post.create({
         author: req.user._id,
         content,
         image,
      });

      // 👇 populate author so frontend gets username + avatar
      post = await post.populate("author", "username avatar");

      res.status(201).json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});


// ---------------- Get feed (paginated) ----------------
router.get("/", authMiddleware, async (req, res) => {
   const limit = parseInt(req.query.limit) || 20;
   const skip = parseInt(req.query.skip) || 0;

   try {
      const posts = await Post.find()
         .populate("author", "username avatar")
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      res.json(posts);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

// ---------------- Get single post ----------------
router.get("/:id", authMiddleware, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id).populate("author", "username avatar").populate("comments.user", "username avatar");
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

// ---------------- Like / Unlike post ----------------
router.post("/:id/like", authMiddleware, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const userId = req.user._id.toString();
      if (post.likes.includes(userId)) {
         // unlike
         post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
         // like
         post.likes.push(userId);
      }

      await post.save();
      res.json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

// ---------------- Comment on post ----------------
router.post("/:id/comment", authMiddleware, async (req, res) => {
   try {
      const { text } = req.body;
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const comment = { user: req.user._id, text };
      post.comments.push(comment);
      await post.save();

      const populatedPost = await post.populate("comments.user", "username avatar");
      res.json(populatedPost);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

module.exports = router;
