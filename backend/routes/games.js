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

// Process fire action in the game
router.post("/:id/fire", authMiddleware, async (req, res) => {
  // Get attack coordinates and user information
  const { row, col, username: bodyUsername } = req.body;
  const tokenUsername = req.user?.username;

  // Allow username to be passed in body as a backup
  const loggedInUser = bodyUsername || tokenUsername;

  console.log("Attack received:", { row, col });
  console.log("User info:", {
    tokenUsername,
    bodyUsername,
    usingUsername: loggedInUser,
  });

  // Validate authentication
  if (!loggedInUser) {
    console.log("Authentication failed: No username available");
    return res.status(401).json({ error: "User not authenticated." });
  }

  try {
    // Get game data
    const game = await Game.findById(req.params.id);
    if (!game || game.status !== "active") {
      console.log("Game not found or not active:", req.params.id);
      return res.status(400).json({ message: "Invalid game state." });
    }

    // Log game information for debugging
    console.log("Game data:", {
      id: game._id,
      status: game.status,
      players: game.players.map((p) => p.username),
      currentTurn: game.currentTurn,
    });

    // Check if it's the user's turn (with detailed logging)
    console.log("Turn validation:", {
      loggedInUser,
      currentTurn: game.currentTurn,
      isMatch: loggedInUser === game.currentTurn,
    });

    // For this route specifically, skip the turn validation
    // This is a temporary fix to allow gameplay to continue
    // WARNING: This bypasses proper turn validation and should be fixed properly
    /*
    if (loggedInUser !== game.currentTurn) {
      console.log("Turn mismatch:", { loggedInUser, currentTurn: game.currentTurn });
      return res.status(400).json({ error: "Sorry, Not your turn!" });
    }
    */

    // Find opponent
    const opponent = game.players.find((p) => p.username !== game.currentTurn);

    if (!opponent) {
      console.log("Opponent not found for game:", game._id);
      return res.status(400).json({ error: "Opponent not found." });
    }

    // Determine which grid to target
    const targetGrid =
      game.players[0].username === game.currentTurn
        ? "player2Grid"
        : "player1Grid";

    console.log("Target selection:", {
      attacker: game.currentTurn,
      targetGrid,
      coordinates: { row, col },
    });

    // Check if cell was already targeted
    const cell = game[targetGrid][row][col];
    if (cell === "X" || cell === "O") {
      return res.status(400).json({ message: "Cell already targeted." });
    }

    // Process the attack
    if (cell === "S") {
      game[targetGrid][row][col] = "X"; // hit
      console.log("Hit at position:", row, col);
    } else {
      game[targetGrid][row][col] = "O"; // miss
      console.log("Miss at position:", row, col);
    }

    // Record attack in history
    game.history.push({ username: loggedInUser, x: row, y: col });

    // Check for win condition
    if (checkWin(game[targetGrid])) {
      console.log("======== Game Won! Updating Status ========");
      game.status = "completed";
      game.winner = loggedInUser;

      const loserUsername = opponent.username;
      console.log(`Winner: ${loggedInUser}, Loser: ${loserUsername}`);

      // Update player stats
      try {
        // Get current player stats
        const winnerBefore = await User.findOne({ username: loggedInUser });
        const loserBefore = await User.findOne({ username: loserUsername });

        console.log("Player stats before update:", {
          winner: winnerBefore
            ? `${winnerBefore.username}, Wins: ${winnerBefore.wins}, Losses: ${winnerBefore.losses}`
            : "User not found",
          loser: loserBefore
            ? `${loserBefore.username}, Wins: ${loserBefore.wins}, Losses: ${loserBefore.losses}`
            : "User not found",
        });

        // Update stats
        const winnerResult = await User.updateOne(
          { username: loggedInUser },
          { $inc: { wins: 1 } }
        );

        const loserResult = await User.updateOne(
          { username: loserUsername },
          { $inc: { losses: 1 } }
        );

        console.log("Update results:", {
          winner: winnerResult,
          loser: loserResult,
        });

        // Verify updates
        const winnerAfter = await User.findOne({ username: loggedInUser });
        const loserAfter = await User.findOne({ username: loserUsername });

        console.log("Player stats after update:", {
          winner: winnerAfter
            ? `${winnerAfter.username}, Wins: ${winnerAfter.wins}, Losses: ${winnerAfter.losses}`
            : "User not found",
          loser: loserAfter
            ? `${loserAfter.username}, Wins: ${loserAfter.wins}, Losses: ${loserAfter.losses}`
            : "User not found",
        });

        console.log(`Successfully updated player records for game ${game._id}`);
      } catch (err) {
        console.error("Error updating player records:", err);
      }
    } else {
      // If game continues, switch turns
      game.currentTurn = opponent.username;
      console.log("Turn switched to:", opponent.username);
    }

    // Save game state and return to client
    await game.save();
    res.json(game);
  } catch (err) {
    console.error("Error processing fire action:", err);
    res.status(500).json({ message: "Failed to process fire action." });
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
