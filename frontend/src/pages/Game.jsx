import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Board from "../components/Board";
import Timer from "../components/Timer";
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

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGame(data);

        // 🧠 Check source AFTER game is fetched
        if (source === "new") {
          console.log(
            "User created a new game. Redirecting to ship placement."
          );
          navigate(`/game/${data._id}/place`);
        } else if (source === "join") {
          console.log("User joined an existing game.");
        } else {
          console.log("User refreshed or navigated here manually.");
        }
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
    fetchGame();
    const interval = setInterval(() => {
      fetchGame();
    }, 3000);
    return () => clearInterval(interval);
  }, [gameId]);

  if (loading) return <p>Loading game...</p>;
  if (!user) return <p>Please log in to play.</p>;
  if (error) return <p>{error}</p>;

  const isPlayer1 = game?.player1?._id === user?._id;
  const isPlayer2 = game?.player2?._id === user?._id;
  const isParticipant = isPlayer1 || isPlayer2;

  const myGrid = isPlayer1 ? game.player1Grid : game.player2Grid;
  const enemyGrid = isPlayer1 ? game.player2Grid : game.player1Grid;

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
          <div>
            <Timer active={game.currentTurn === user.username} />
            <Board
              title="Enemy Board"
              grid={enemyGrid}
              onCellClick={(row, col) => handleAttack(row, col)}
              isEnemyBoard={true}
            />
          </div>
          <div>
            <Board title="Your Board" grid={myGrid} isEnemyBoard={false} />
          </div>
        </div>

        <p>Status: {game.status}</p>
        <p>Turn: {game.currentTurn}</p>
        {game.winner && <p>Winner: {game.winner.username}</p>}
      </main>
      <Footer />
    </div>
  );
};

export default Game;
