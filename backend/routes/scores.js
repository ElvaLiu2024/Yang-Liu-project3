const express = require("express");
const router = express.Router();
const User = require("../models/User");

// GET /api/scores
router.get("/", async (req, res) => {
  try {
    console.log("Fetching scores for leaderboard...");
    const users = await User.find().select("username wins losses");

    console.log("Raw leaderboard data:", JSON.stringify(users));

    const sorted = users.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return a.username.localeCompare(b.username);
    });

    console.log("Sorted leaderboard data:", JSON.stringify(sorted));

    res.json(sorted);
  } catch (err) {
    console.error("Failed to get scores:", err);
    res.status(500).json({ message: "Failed to fetch scores." });
  }
});

module.exports = router;
