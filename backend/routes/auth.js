const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRATION_TIME = "1d";

// Middleware for protected routes
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

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    console.log("Register attempt for:", username);

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

    console.log("Creating new user:", username);

    // 创建用户时直接使用原始密码，让pre-save钩子来处理哈希
    const user = new User({ username, password });
    await user.save();
    console.log(
      "User saved to database with hashed password (via pre-save hook)"
    );

    // 创建JWT令牌
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    });
    console.log("JWT token created");

    // 设置cookie并返回响应
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ username: user.username, success: true });

    console.log("Registration successful for:", username);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});
// Regular login with password verification
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for user:", username);

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("Found user:", user.username);
    console.log(
      "Stored password hash:",
      user.password.substring(0, 10) + "..."
    );
    console.log("Attempting to compare with provided password");

    // Compare password with hash in database
    const match = await bcrypt.compare(password, user.password);
    console.log("Password match result:", match);

    if (!match) {
      console.log("Password doesn't match for user:", username);
      return res
        .status(400)
        .json({ message: "Invalid credentials: Incorrect password" });
    }

    // Create token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    });

    // Set cookie with token
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .status(200)
      .json({ username: user.username, success: true });

    console.log("Login successful for:", username);
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
});

// Simple login route that skips password verification
router.post("/simple-login", async (req, res) => {
  try {
    const { username } = req.body;
    console.log("Simple login attempt for:", username);

    const user = await User.findOne({ username });

    if (!user) {
      console.log("Simple login: User not found:", username);
      return res.status(401).json({ message: "User not found" });
    }

    // Create token without password verification
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    });

    // Set cookie with token
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // Set to false for local testing
        sameSite: "lax",
      })
      .status(200)
      .json({ username: user.username, success: true });

    console.log("Simple login successful for:", username);
  } catch (error) {
    console.error("Simple login error:", error);
    return res
      .status(500)
      .json({ message: "Server error during simple login" });
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logged out successfully" });
});

// Route to check current user
router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json(null);

  try {
    const data = jwt.verify(token, JWT_SECRET);
    res.json({ username: data.username });
  } catch {
    res.clearCookie("token").json(null);
  }
});

router.get("/test-bcrypt", async (req, res) => {
  const testPassword = "testpassword";
  const hash = await bcrypt.hash(testPassword, 10);
  console.log("Test hash created:", hash);

  const match = await bcrypt.compare(testPassword, hash);
  console.log("Test match result:", match);

  res.json({ hash, match });
});

router.get("/test-password/:username/:password", async (req, res) => {
  try {
    const { username, password } = req.params;

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    // Log details for debugging
    console.log("Test route - Username:", username);
    console.log("Test route - Password provided:", password);
    console.log("Test route - Stored hash:", user.password);

    // Try comparing with bcrypt
    const bcryptMatch = await bcrypt.compare(password, user.password);
    console.log("Test route - bcrypt match result:", bcryptMatch);

    // Try a manual string comparison (just for debugging)
    const testHash = await bcrypt.hash(password, 10);
    console.log("Test route - New hash of provided password:", testHash);

    return res.json({
      username,
      storedHash: user.password,
      providedPassword: password,
      bcryptMatch,
      newHashForSamePassword: testHash,
    });
  } catch (error) {
    console.error("Test password route error:", error);
    return res.status(500).json({ error: "Test route error" });
  }
});

router.get("/debug-password/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const testPassword = "password123"; // A known test password

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    // Log the user object
    console.log("User object:", user);

    // Create a fresh hash of the test password
    const freshHash = await bcrypt.hash(testPassword, 10);

    // Try comparing with the test password
    const testMatch = await bcrypt.compare(testPassword, user.password);

    // Try updating the user with the fresh hash
    user.password = freshHash;
    await user.save();

    // Try comparing again after update
    const user2 = await User.findOne({ username });
    const testMatch2 = await bcrypt.compare(testPassword, user2.password);

    return res.json({
      username,
      originalHash: user.password,
      freshHash,
      testMatchBefore: testMatch,
      testMatchAfter: testMatch2,
    });
  } catch (error) {
    console.error("Debug password route error:", error);
    return res.status(500).json({ error: "Debug route error" });
  }
});

router.post("/plaintext-login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Plaintext login attempt for:", username);

    // Get the user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Get a new user with the fresh password and save
    const newUser = new User({
      username: username + "_new",
      password: password, // Store plain text just for testing
    });
    await newUser.save();
    console.log("New user created with plain password for testing");

    // Create token
    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION_TIME,
    });

    // Set cookie with token
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      })
      .status(200)
      .json({ username: user.username, success: true });

    console.log("Plaintext login successful for:", username);
  } catch (error) {
    console.error("Plaintext login error:", error);
    return res
      .status(500)
      .json({ message: "Server error during plaintext login" });
  }
});
module.exports = router;
