const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Utility to check if all cells are hit
function checkWin(grid) {
  for (let row of grid) {
    for (let cell of row) {
      if (cell === "S") return false; // If a cell is not marked as hit, the game isn't won
    }
  }
  return true; // All cells hit, win
}
// Create a new game
router.post("/new", authMiddleware, async (req, res) => {
  const username = req.user.username;
  console.log("Creating a new game for user:", username, req.body);

  try {
    // Check if player is trying to create a game against themselves
    if (req.body.players && req.body.players.length === 1) {
      return res
        .status(400)
        .json({ message: "You cannot play against yourself." });
    }

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
      timeLeft: 60,
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
router.post("/:id/join", authMiddleware, async (req, res) => {
  const username = req.user.username;
  console.log(`User ${username} attempting to join game ${req.params.id}`);
  try {
    const game = await Game.findById(req.params.id);
    if (!game || game.players.length >= 2) {
      return res.status(400).json({ message: "Game not available." });
    }
    game.players.push({ username });
    game.status = "active"; // Change game status to active
    await game.save();
    console.log("User joined game:", game);
    res.json(game); // Return the updated game
  } catch (err) {
    console.error("Error joining game:", err);
    res.status(500).json({ message: "Failed to join game." });
  }
});

// Place ships
router.post("/:id/place", authMiddleware, async (req, res) => {
  const { username, grid } = req.body;
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      console.log("No game found with the given ID.");
      return res.status(404).json({ message: "Game not found." });
    }

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
  console.log("🟢 Received request to /api/games");
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    console.log("Games fetched:", games);
    games.forEach((g, idx) => {
      if (!Array.isArray(g.players)) {
        console.warn(`⚠️ Game ${idx} has invalid players:`, g.players);
      }
    });
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
    console.log("Fetched game data:", game);
    if (!game) return res.status(404).json({ message: "Game not found" });
    res.json(game); // Return the specific game by ID
  } catch (err) {
    res.status(500).json({ message: "Failed to get game." });
  }
});

// Update the time left every second
router.post("/:id/start", async (req, res) => {
  const gameId = req.params.id;
  const game = await Game.findById(gameId);

  if (game && game.status === "active") {
    // Initialize the timer to 60 seconds if not already set
    if (game.timeLeft === undefined || game.timeLeft === 0) {
      game.timeLeft = 60;
    }

    await game.save();
    console.log("Game started. Initial timeLeft: 60");

    const timerInterval = setInterval(async () => {
      const game = await Game.findById(gameId);
      console.log(`Before decrement: timeLeft = ${game.timeLeft}`);

      if (game && game.status === "active" && game.timeLeft > 0) {
        game.timeLeft -= 1;
        await game.save(); // Save the updated game state to the database
        console.log("Updated timeLeft in backend:", game.timeLeft);
      } else {
        game.status = "completed"; // End the game if the time reaches 0
        await game.save();
        clearInterval(timerInterval); // Stop the timer when time reaches 0
        console.log("Timer stopped at 0.");
      }
    }, 1000);
  } else {
    res.status(400).json({ message: "Game is not active." });
  }
});

router.post("/:id/fire", authMiddleware, async (req, res) => {
  const { row, col } = req.body;
  const loggedInUser = req.user?.username;
  console.log("Attack received:", { row, col });
  console.log("User from auth token:", loggedInUser);
  console.log("Request user object:", req.user);

  if (!loggedInUser) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    const game = await Game.findById(req.params.id);
    if (!game || game.status !== "active") {
      console.log("No game found with the given ID or game not active");
      return res.status(400).json({ message: "Invalid game state." });
    }

    console.log("Game data:", {
      id: game._id,
      status: game.status,
      players: game.players,
      currentTurn: game.currentTurn,
    });

    console.log("Turn check:", {
      loggedInUser,
      currentTurn: game.currentTurn,
      isMatch: loggedInUser === game.currentTurn,
      typeLoggedIn: typeof loggedInUser,
      typeCurrentTurn: typeof game.currentTurn,
    });

    // 确保两个字符串是严格相等的，并修复可能的空格或大小写问题
    const normalizedLoggedUser = loggedInUser ? loggedInUser.trim() : "";
    const normalizedCurrentTurn = game.currentTurn
      ? game.currentTurn.trim()
      : "";

    if (normalizedLoggedUser !== normalizedCurrentTurn) {
      console.log("Turn mismatch after normalization:", {
        normalizedLoggedUser,
        normalizedCurrentTurn,
      });
      return res.status(400).json({ error: "Sorry, Not your turn!" });
    }

    // Process attack
    const opponent = game.players.find((p) => p.username !== game.currentTurn);
    if (!opponent) {
      console.log("Opponent not found for game:", game._id);
      return res.status(400).json({ error: "Opponent not found." });
    }

    console.log("Opponent found:", opponent);

    const targetGrid =
      game.players[0].username === game.currentTurn
        ? "player2Grid"
        : "player1Grid";

    console.log("Target grid selected:", targetGrid);

    const cell = game[targetGrid][row][col];
    if (cell === "X" || cell === "O") {
      return res.status(400).json({ message: "Cell already targeted." });
    }

    if (cell === "S") {
      game[targetGrid][row][col] = "X"; // hit
      console.log("Hit at position:", row, col);
    } else {
      game[targetGrid][row][col] = "O"; // miss
      console.log("Miss at position:", row, col);
    }

    game.history.push({ username: loggedInUser, x: row, y: col });

    if (checkWin(game[targetGrid])) {
      // 游戏获胜代码，保持不变
      // ...
    }

    // Switch turns
    game.currentTurn = opponent.username;
    console.log("Updated turn in backend:", game.currentTurn);

    await game.save();
    res.json(game); // Send the updated game state back to the frontend
  } catch (err) {
    console.error("Error processing fire:", err);
    res.status(500).json({ message: "Failed to process fire." });
  }
});
// Skip turn
router.post("/:id/skip", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game || game.status !== "active") {
      return res.status(400).json({ message: "Invalid game state." });
    }

    const currentPlayer = game.currentTurn;
    const opponent = game.players.find(
      (p) => p.username !== currentPlayer
    )?.username;

    if (!opponent) {
      return res.status(400).json({ message: "Opponent not found." });
    }

    // Push a history entry that it was skipped
    game.history.push({
      username: currentPlayer,
      skipped: true,
      timestamp: new Date(),
    });

    game.currentTurn = opponent.username;

    await game.save();
    res.json({ message: "Turn skipped.", game });
  } catch (err) {
    console.error("Skip turn error:", err);
    res.status(500).json({ message: "Failed to skip turn." });
  }
});

module.exports = router;
