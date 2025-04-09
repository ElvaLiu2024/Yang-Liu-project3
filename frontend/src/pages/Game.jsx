import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Board from "../components/Board";
import Timer from "../components/Timer";
import GameOver from "../components/GameOver";
import { UserContext } from "../context/UserContext";
import { useLocation } from "react-router-dom";
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
    if (source === "new") {
      navigate(`/game/${gameId}/place`);
      console.log("This user created a new game.");
    } else if (source === "join") {
      console.log("This user joined an existing game.");
    } else {
      console.log("User refreshed or came from outside.");
    }
  }, [source]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGame(data);
      } else {
        setError("Game not found or access denied");
        navigate("/games");
      }
    } catch (err) {
      setError("Failed to load game.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame(); // Initial fetch
    const interval = setInterval(() => {
      fetchGame(); // Poll every 3 seconds
    }, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:5000/game/${gameId}`);

    socket.onopen = () => {
      console.log("Connected to game WebSocket.");
    };

    socket.onmessage = (event) => {
      const updatedGame = JSON.parse(event.data);
      setGame(updatedGame); // 更新游戏状态
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error: ", error);
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket.");
    };

    return () => socket.close();
  }, [gameId]);

  if (loading) return <p>Loading game...</p>;
  if (!user) return <p>Please log in to play.</p>;
  if (error) return <p>{error}</p>;

  const isPlayer1 = game?.player1?._id === user?._id;
  const isPlayer2 = game?.player2?._id === user?._id;
  const isParticipant = isPlayer1 || isPlayer2;

  const myGrid = isPlayer1 ? game.player1Grid : game.player2Grid;
  const enemyGrid = isPlayer1 ? game.player2Grid : game.player1Grid;

  console.log("My Grid: ", myGrid);
  console.log("Enemy Grid: ", enemyGrid);

  const handleAttack = async (row, col) => {
    if (!isParticipant || game.status !== "active") return;

    if (user.username !== game.currentTurn) {
      return alert("Not your turn!");
    }

    try {
      const res = await fetch(`/api/games/${gameId}/fire`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row, col }),
      });
      if (res.ok) {
        const data = await res.json();
        setGame(data);
      } else {
        alert("Invalid move or not your turn");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="game-container">
      <Navbar />
      <main className="game-content">
        <h1>Game #{gameId.slice(-5)}</h1>

        {game.winner && <GameOver winner={game.winner.username} />}

        <div className="game-board">
          <Board
            title="Enemy Board"
            grid={enemyGrid}
            onCellClick={handleAttack}
            isEnemyBoard={true}
            timeLeft={game.timeLeft}
          />
          <Board
            title="Your Board"
            grid={myGrid}
            onCellClick={handleAttack}
            isEnemyBoard={false}
            timeLeft={game.timeLeft}
          />
        </div>

        <div className="status">
          <p>Status: {game.status}</p>
        </div>
        <div className="turn">
          <p>Turn: {game.currentTurn}</p>
        </div>
        {game.currentTurn !== user.username && (
          <p style={{ color: "red" }}>It's not your turn!</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Game;
