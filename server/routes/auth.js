const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRATION_TIME = "1d";
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (
    !username ||
    username.length < 3 ||
    username.length > 20 ||
    !/^[a-zA-Z0-9]+$/.test(username)
  ) {
    return res.status(400).json({
      message:
        "Invalid username. It must be 3-20 characters long and only contain letters and numbers.",
    });
  }

  if (!password || password !== confirmPassword || password.length < 6) {
    return res.status(400).json({
      message:
        "Invalid password. It must be at least 6 characters long and passwords must match.",
    });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: "Username already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();

  const token = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION_TIME }
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json({ username: user.username });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res
      .status(400)
      .json({ message: "Invalid credentials: Incorrect password" });

  const token = jwt.sign(
    { id: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION_TIME }
  );

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
    .json({ username: user.username });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
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
