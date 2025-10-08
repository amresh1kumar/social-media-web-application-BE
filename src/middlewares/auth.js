const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
   try {
      console.log("JWT_SECRET:", process.env.JWT_SECRET);

      // 1. Token header se nikalna
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
         return res.status(401).json({ message: "No token, authorization denied" });
      }

      // 2. Token verify karna
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. User find karna
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
         return res.status(401).json({ message: "User not found" });
      }

      next(); // ✅ sab thik, aage badho
   } catch (err) {
      console.error("Auth middleware error:", err.message);
      res.status(401).json({ message: "Token is not valid" });
   }
};
