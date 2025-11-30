const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // the model you created

const router = express.Router();
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 1) basic validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2) check if user already exists by email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3) hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4) create a new User document
    const user = new User({
      username,
      email,
      passwordHash,
      role, // "customer" or "artisan" coming from frontend
    });

    // 5) save to MongoDB
    await user.save();

    // 6) send success response (no token yet, just confirm)
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error during signup" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2) find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3) compare plain password with stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4) create JWT with user id and role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5) send token + role + username to frontend
    res.json({
      token,
      role: user.role,        // "customer" or "artisan"
      username: user.username,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
});
module.exports = router;