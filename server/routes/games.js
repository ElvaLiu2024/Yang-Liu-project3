const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const User = require("../models/User");

// Utility to check if all cells are hit
function checkWin(grid) {
  for (let row of grid) {
    for (let cell of row) {
      if (cell !== null && cell !== "X") return false; // If a cell is not marked as hit, the game isn't won
    }
  }
  return true; // All cells hit, win
}

// Create a new game
router.post("/new", async (req, res) => {
  const { username } = req.body;
  console.log("Creating a new game for user:", username);
  try {
    const game = new Game({
      players: [{ username }],
      status: "open",
      currentTurn: username,
      player1Grid: Array(10)
        .fill()
        .map(() => Array(10).fill(null)), // 10x10 grid for player 1
      player2Grid: Array(10)
        .fill()
        .map(() => Array(10).fill(null)), // 10x10 grid for player 2
      history: [],
    });
    await game.save();
    console.log("New game created:", game);
    res.status(201).json(game); // Return the newly created game
  } catch (err) {
    console.error("Error creating game:", err);
    res
      .status(500)
      .json({ message: "Failed to create game.", error: err.message });
  }
});

// Join a game
router.post("/:id/join", async (req, res) => {
  const { username } = req.body;
  try {
    const game = await Game.findById(req.params.id);
    if (!game || game.players.length >= 2) {
      return res.status(400).json({ message: "Game not available." });
    }
    game.players.push({ username });
    game.status = "active"; // Change game status to active
    await game.save();
    res.json(game); // Return the updated game
  } catch (err) {
    res.status(500).json({ message: "Failed to join game." });
  }
});

// Place ships
router.post("/:id/place", async (req, res) => {
  const { username, grid } = req.body; // grid should be a 10x10 array with ships marked as "S"
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game not found." });

    const isPlayer1 = game.players[0]?.username === username;
    const isPlayer2 = game.players[1]?.username === username;

    if (!isPlayer1 && !isPlayer2) {
      return res
        .status(403)
        .json({ message: "You are not part of this game." });
    }

    if (isPlayer1) game.player1Grid = grid;
    if (isPlayer2) game.player2Grid = grid;

    await game.save();
    res.json({ message: "Ships placed successfully.", game }); // Return the updated game
  } catch (err) {
    res.status(500).json({ message: "Failed to place ships." });
  }
});

// Get all games
router.get("/", async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json(games); // Return all games sorted by creation time
  } catch (err) {
    console.error("Game.js - Error fetching games:", err);
    res.status(500).json({ message: "Failed to fetch games." });
  }
});

// Get specific game
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game); // Return the specific game by ID
  } catch (err) {
    res.status(500).json({ message: "Failed to get game." });
  }
});

// Fire (make a move)
router.post("/:id/fire", async (req, res) => {
  const { row, col } = req.body;
  try {
    const game = await Game.findById(req.params.id);
    if (!game || game.status !== "active") {
      return res.status(400).json({ message: "Invalid game state." });
    }

    const currentUser = game.currentTurn;
    const opponent = game.players.find(
      (p) => p.username !== currentUser
    )?.username;
    const targetGrid =
      game.players[0].username === currentUser ? "player2Grid" : "player1Grid";

    if (game[targetGrid][row][col] !== null) {
      return res.status(400).json({ message: "Cell already targeted." });
    }

    game[targetGrid][row][col] = "X"; // Mark as hit
    game.history.push({ username: currentUser, x: row, y: col });

    const opponentGrid =
      targetGrid === "player1Grid" ? game.player1Grid : game.player2Grid;
    if (checkWin(opponentGrid)) {
      game.status = "completed";
      game.winner = { username: currentUser };
    } else {
      game.currentTurn = opponent;
    }

    await game.save();
    res.json(game); // Return the updated game
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to process fire." });
  }
});

module.exports = router;
