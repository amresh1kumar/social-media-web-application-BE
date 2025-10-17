const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");



exports.registerUser = async (req, res) => {
   try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
         return res.status(400).json({ message: "All fields are required" });
      }

      // check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({ message: "User already exists" });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create user with avatar if provided
      const user = await User.create({
         username,
         email,
         password: hashedPassword,
         avatar: req.file ? `/uploads/${req.file.filename}` : "", // ✅ avatar added here
      });

      // create JWT token
      const token = jwt.sign(
         { id: user._id },
         process.env.JWT_SECRET,
         { expiresIn: process.env.JWT_EXP }
      );

      res.status(201).json({
         message: "User registered successfully",
         user,
         token,
      });

   } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
   }
};

exports.loginUser = async (req, res) => {
   const { email, password } = req.body;
   try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP });
      res.json({ user, token });
   } catch (err) {
      res.status(500).json({ message: err.message });
   }
};

exports.getPosts = async (req, res) => {
   try {
      const posts = await Post.find()
         .populate("user", "username email")
         .lean();

      // null users filter karo (agar koi purana deleted user ka post bacha ho)
      const cleanPosts = posts.filter((p) => p.user !== null);

      res.json(cleanPosts);
   } catch (err) {
      res.status(500).json({ error: "Failed to fetch posts" });
   }
};



exports.deleteUser = async (req, res) => {
   try {
      const userId = req.params.id;

      // Step 1: delete user
      await User.findByIdAndDelete(userId);

      // Step 2: delete related posts
      await Post.deleteMany({ author: userId });

      // Step 3: delete related notifications
      await Notification.deleteMany({ user: userId });

      // Step 4: delete related conversations
      await Conversation.deleteMany({ participants: userId });

      res.json({ message: "✅ User and related data deleted successfully" });
   } catch (err) {
      console.error("Delete user error:", err);
      res.status(500).json({ error: "Failed to delete user" });
   }
};


exports.getConversations = async (req, res) => {
   try {
      const convs = await Conversation.find({ participants: req.user._id })
         .populate("participants", "username email")
         .lean();

      // null users remove karo
      const cleanConvs = convs.filter(
         (c) => c.participants.every((p) => p !== null)
      );

      res.json(cleanConvs);
   } catch (err) {
      res.status(500).json({ error: "Failed to fetch conversations" });
   }
};
