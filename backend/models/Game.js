const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  players: [
    {
      username: { type: String, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["open", "active", "completed"],
    default: "open",
  },
  currentTurn: { type: String, required: true },
  player1Grid: { type: [[String]], required: true }, // A 10x10 grid for player 1
  player2Grid: { type: [[String]], required: true }, // A 10x10 grid for player 2
  history: { type: [Object], default: [] }, // Stores move history
  winner: { type: String, default: null }, // The winner of the game
  timeLeft: { type: Number, default: 60 }, // Added timeLeft field with default value of 60 seconds
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
