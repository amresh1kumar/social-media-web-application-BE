const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middlewares/auth");
const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ---------------- Multer setup ----------------
const storage = multer.diskStorage({
   destination: (req, file, cb) => cb(null, "uploads/"),
   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post creation and management routes
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "My first post!"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Post created successfully
 *       500:
 *         description: Server error
 */

// this is for local post   
// router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
//    try {
//       const { content } = req.body;
//       const image = req.file ? req.file.filename : null;

//       let post = await Post.create({
//          author: req.user._id,
//          content,
//          image,
//       });

//       post = await post.populate("author", "username avatar");
//       res.status(201).json(post);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });

// this is for cloudinary store

router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
   try {
      const { content } = req.body;
      let imageUrl = null;

      // ✅ Agar image hai to Cloudinary pe upload karo
      if (req.file) {
         const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social-media-posts", // apni Cloudinary folder ka naam
         });
         imageUrl = result.secure_url;

         // ✅ Temporary file ko delete karo
         fs.unlinkSync(req.file.path);
      }

      // ✅ Post create karo with Cloudinary image URL
      let post = await Post.create({
         author: req.user._id,
         content,
         image: imageUrl,
      });

      post = await post.populate("author", "username avatar");
      res.status(201).json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});


/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get feed posts (paginated)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of posts to return (default 20)
 *       - name: skip
 *         in: query
 *         schema:
 *           type: integer
 *         description: Number of posts to skip (default 0)
 *     responses:
 *       200:
 *         description: List of posts
 *       500:
 *         description: Server error
 */
// router.get("/", authMiddleware, async (req, res) => {
//    const limit = parseInt(req.query.limit) || 20;
//    const skip = parseInt(req.query.skip) || 0;

//    try {
//       const posts = await Post.find()
//          .populate("author", "username avatar")
//          .sort({ createdAt: -1 })
//          .skip(skip)
//          .limit(limit);

//       res.json(posts);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });

router.get("/", authMiddleware, async (req, res) => {
   const limit = parseInt(req.query.limit) || 20;
   const skip = parseInt(req.query.skip) || 0;

   try {
      const posts = await Post.find()
         .populate("author", "username avatar")
         .populate("comments.user", "username avatar")
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      res.json(posts);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});


/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post object
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.get("/:id", authMiddleware, async (req, res) => {
   try {
      const post = await Post.findById(req.params.id)
         .populate("author", "username avat ar")
         .populate("comments.user", "usernameavatar");
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Like or unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post liked/unliked successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
// router.post("/:id/like", authMiddleware, async (req, res) => {
//    try {
//       const post = await Post.findById(req.params.id);
//       if (!post) return res.status(404).json({ message: "Post not found" });

//       const userId = req.user._id.toString();
//       if (post.likes.includes(userId)) {
//          post.likes = post.likes.filter((id) => id.toString() !== userId);
//       } else {
//          post.likes.push(userId);
//       }

//       await post.save();
//       res.json(post);
//    } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: "Server error" });
//    }
// });

router.post("/:id/like", authMiddleware, async (req, res) => {
   try {
      let post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const userId = req.user._id.toString();

      if (post.likes.includes(userId)) {
         // Unlike
         post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
         // Like
         post.likes.push(userId);
      }

      await post.save();

      // ✅ Populate after save
      post = await Post.findById(req.params.id)
         .populate("author", "username avatar")
         .populate("comments.user", "username avatar");

      res.json(post);
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
});

/**
 * @swagger
 * /posts/{id}/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Nice post!"
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
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
