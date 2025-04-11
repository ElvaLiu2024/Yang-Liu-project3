const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/scores
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username wins losses");

    const sorted = users.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return a.username.localeCompare(b.username);
    });

    res.json(sorted);
  } catch (err) {
    console.error("Failed to get scores:", err);
    res.status(500).json({ message: "Failed to fetch scores." });
  }
});

module.exports = router;
