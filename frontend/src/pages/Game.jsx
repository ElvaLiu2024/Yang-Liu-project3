import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Board from "../components/Board";
import GameOver from "../components/GameOver";
import { UserContext } from "../context/UserContext";
import Timer from "../components/Timer"; // Import Timer component
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
  const [gameOver, setGameOver] = useState(false);

  // Fetch game data and set up interval to keep fetching game status
  useEffect(() => {
    fetchGame();
    const interval = setInterval(() => {
      console.log("Checking game status...");
      fetchGame();
      if (game) {
        console.log("Current game status:", game.status);
        console.log("Current game winner:", game.winner);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [gameId]);

  // Fetch game data
  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched game data:", data);

        if (data.status === "completed") {
          console.log("Game is completed, winner:", data.winner);
          setGameOver(true);

          setTimeout(() => {
            console.log("Redirecting to All Games...");
            navigate("/games");
          }, 3000);
        }

        setGame(data);
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

  // This useEffect ensures that when the user is logged in and we come from "new" game page, we navigate correctly
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
  }, [source, gameId, navigate, user]);

  // Handle the timeout when the time for the current turn is up
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

  // Handle the attack logic
  const handleAttack = async (row, col) => {
    console.log("Attack coordinates:", row, col);

    // Fetch the latest game state from the backend
    try {
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

      const attackRes = await fetch(`/api/games/${gameId}/fire`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col }),
      });

      const response = await attackRes.json();

      if (attackRes.ok) {
        console.log("Game updated after attack:", response);

        setGame(response);

        if (response.status === "completed") {
          console.log("Game completed after this attack!");
          console.log("Winner is:", response.winner);
          setGameOver(true);
          setGame({ ...response });
        }
      } else {
        alert(response.error || "Invalid move or not your turn");
      }
    } catch (err) {
      console.error("Error making attack:", err);
    }
  };

  if (!user) return <p>Please log in to play.</p>;
  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;
  if (!game) return <p>No game data available.</p>;

  const player1 = game?.players[0];
  const player2 = game?.players[1];

  const isPlayer1 = player1?.username === user.username;
  const isPlayer2 = player2?.username === user.username;

  const myGrid = isPlayer1 ? game?.player1Grid : game?.player2Grid;
  const enemyGrid = isPlayer1 ? game?.player2Grid : game?.player1Grid;

  const shouldShowTimer =
    game?.status === "active" && user.username === game.currentTurn;

  console.log("Rendering game with status:", game?.status);
  console.log("Game winner:", game?.winner);
  console.log("Game over state:", gameOver);

  return (
    <div className="game-container">
      <Navbar />
      <main className="game-content">
        <h1>Game #{gameId.slice(-5)}</h1>

        <div className="game-status-info">
          <p>Status: {game?.status}</p>
          <p>Turn: {game?.currentTurn}</p>
        </div>

        {(game?.status === "completed" || gameOver) && game?.winner && (
          <GameOver winner={game?.winner} />
        )}

        <div className="game-board">
          <Board
            title="Enemy Board"
            grid={enemyGrid}
            onCellClick={handleAttack}
            isOwnBoard={false}
            timeLeft={shouldShowTimer ? game?.timeLeft : null}
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

        {shouldShowTimer && (
          <Timer initialTime={game?.timeLeft} onTimeUp={handleTimeUp} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Game;
