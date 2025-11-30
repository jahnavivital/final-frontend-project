const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,         // must be given
    trim: true,
  },
  email: {
    type: String,
    required: true,         // must be given
    unique: true,           // no duplicate emails
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,         // will store hashed password
  },
  role: {
    type: String,
    enum: ["customer", "artisan"], // only these two allowed
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,      // auto set when user is created
  },
});

// Model name "User" → collection "users"
const User = mongoose.model("User", userSchema);

module.exports = User;