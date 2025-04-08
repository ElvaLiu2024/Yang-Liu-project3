const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || password !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Invalid input or passwords do not match" });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
  res
    .cookie("token", token, { httpOnly: true })
    .json({ username: user.username });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
  res
    .cookie("token", token, { httpOnly: true })
    .json({ username: user.username });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out" });
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json(null);

  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.json({ username: data.username });
  } catch {
    res.json(null);
  }
});

module.exports = router;
