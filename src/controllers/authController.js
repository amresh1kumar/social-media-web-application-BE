const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
   const { username, email, password } = req.body;
   try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, email, password: hashedPassword });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP });
      res.status(201).json({ user, token });
   } catch (err) {
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
