import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Board from "../components/Board";
import GameOver from "../components/GameOver";
import { UserContext } from "../context/UserContext";
import "../styles/Game.css";

const Game = () => {
  const { gameId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const source = location.state?.from;

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched game data:", data);
        setGame(data);
        if (data.status === "completed") {
          console.log("Winner:", data.winner); // Log winner here
        }
      } else {
        setError("Game not found or access denied");
        navigate("/games");
      }
    } catch (err) {
      setError("Failed to load game.");
      console.error("Error fetching game data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
    const interval = setInterval(() => {
      if (game.status === "completed") {
        clearInterval(interval);
      } else {
        fetchGame();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [gameId, game.status]);

  useEffect(() => {
    if (!user) {
      console.log("User refreshed or came from outside.");
      navigate("/login");
      return;
    }

    if (source === "new") {
      navigate(`/game/${gameId}/place`);
    } else if (!source) {
      console.log("User refreshed or came from outside.");
    }
  }, [source, gameId, navigate, game]);

  const handleTimeUp = async () => {
    if (!game || !user || user.username !== game.currentTurn) return;
    try {
      const res = await fetch(`/api/games/${gameId}/skip`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGame(data.game);
      } else {
        console.warn("Skip failed");
      }
    } catch (err) {
      console.error("Error skipping turn:", err);
    }
  };

  const handleAttack = async (row, col) => {
    console.log("Attack coordinates:", row, col);

    // Fetch the latest game state from the backend
    const res = await fetch(`/api/games/${gameId}`, {
      credentials: "include",
    });
    const updatedGame = await res.json();
    console.log("Fetched game data:", updatedGame);

    console.log("Current turn in backend:", updatedGame.currentTurn);

    // Ensure it's the correct player's turn
    if (
      !user ||
      updatedGame.status !== "active" ||
      user.username !== updatedGame.currentTurn
    ) {
      console.log("Not your turn. Current player:", updatedGame.currentTurn);
      return alert("Please wait your turn!");
    }

    try {
      const attackRes = await fetch(`/api/games/${gameId}/fire`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col }),
      });

      const response = await attackRes.json();
      if (attackRes.ok) {
        console.log("Game updated:", response);
        setGame(response); // Update the game state from the backend

        // Check if the game is over after the attack
        if (response.status === "completed") {
          handleGameOver(); // Call the game over function
        }
      } else {
        alert(response.error || "Invalid move or not your turn");
      }
    } catch (err) {
      console.error("Error making attack:", err);
    }
  };

  // Handle Game Over and Redirect Losing Player
  const handleGameOver = () => {
    if (game.status === "completed") {
      // Identify the losing player
      clearInterval(interval);
      const losingPlayer =
        user.username === game.winner ? game.currentTurn : user.username;

      // Show the "Game Over" and "XX Wins!" message, then redirect after a delay
      setTimeout(() => {
        console.log("Redirecting to All Games...");
        navigate("/games");
      }, 3000); // 3 seconds delay
    }
  };

  if (!user) return <p>Please log in to play.</p>;
  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;
  if (!game || !Array.isArray(game.players)) return <p>Loading game data...</p>;

  const player1 = game.players[0];
  const player2 = game.players[1];

  const isPlayer1 = player1?.username === user.username;
  const isPlayer2 = player2?.username === user.username;
  const isParticipant = isPlayer1 || isPlayer2;

  const myGrid = isPlayer1 ? game.player1Grid : game.player2Grid;
  const enemyGrid = isPlayer1 ? game.player2Grid : game.player1Grid;

  const shouldShowTimer =
    game.status === "active" && user.username === game.currentTurn;

  return (
    <div className="game-container">
      <Navbar />
      <main className="game-content">
        <h1>Game #{gameId.slice(-5)}</h1>
        {game.status === "completed" && (
          <div>
            {console.log("Game is completed, winner:", game.winner)}
            <GameOver winner={game.winner} />{" "}
          </div>
        )}
        <div className="game-board">
          <Board
            title="Enemy Board"
            grid={enemyGrid}
            onCellClick={handleAttack}
            isOwnBoard={false}
            timeLeft={shouldShowTimer ? game.timeLeft : null}
            onTimeUp={handleTimeUp}
          />
          <Board
            title="Your Board"
            grid={myGrid}
            onCellClick={() => {}}
            isOwnBoard={true}
            timeLeft={null}
          />
        </div>
        <p>Status: {game.status}</p>
        <p>Turn: {game.currentTurn}</p>
      </main>
      <Footer />
    </div>
  );
};

export default Game;
