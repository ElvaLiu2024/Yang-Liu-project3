// ✅ AllGames.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/AllGames.css";

const GameCard = ({ game, onClick, showWinner = false, showJoin = false }) => (
  <div className="game-card" key={game._id}>
    <p>Status: {game.status}</p>
    <p>
      Players:{" "}
      {Array.isArray(game.players)
        ? game.players.map((p) => p.username).join(" vs ")
        : "No players"}
    </p>
    {showWinner && <p>Winner: {game.winner?.username}</p>}
    <button onClick={onClick}>{showJoin ? "Join Game" : "View Game"}</button>
  </div>
);

const AllGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/games");
        const text = await res.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          setError("Invalid data format received.");
        }
      } catch (err) {
        setError("Failed to load games: " + err.message);
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleNewGame = async () => {
    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }
    const res = await fetch("/api/games/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: user.username }),
    });
    if (res.ok) {
      const game = await res.json();
      navigate(`/game/${game._id}`, { state: { from: "new" } });
    } else {
      alert("Failed to create game.");
    }
  };

  const handleJoin = async (gameId) => {
    if (!user) return alert("Please login first.");
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: user.username }),
    });
    if (res.ok) {
      navigate(`/game/${gameId}/place`, { state: { from: "join" } });
    } else {
      alert("Failed to join game.");
    }
  };

  const openGames = games.filter(
    (game) =>
      game.status === "open" &&
      Array.isArray(game.players) &&
      !game.players.find((p) => p.username === user?.username)
  );

  const myOpenGames = games.filter(
    (game) =>
      game.status === "open" &&
      Array.isArray(game.players) &&
      game.players[0]?.username === user?.username
  );

  const myActiveGames = games.filter(
    (game) =>
      game.status === "active" &&
      Array.isArray(game.players) &&
      game.players.some((p) => p.username === user?.username)
  );

  const myCompletedGames = games.filter(
    (game) =>
      game.status === "completed" &&
      Array.isArray(game.players) &&
      game.players.some((p) => p.username === user?.username)
  );

  const otherGames = games
    .filter(
      (game) =>
        (game.status === "active" || game.status === "completed") &&
        Array.isArray(game.players)
    )
    .filter((game) => !game.players.some((p) => p.username === user?.username));

  return (
    <div className="all-games-page">
      <h2>Available Games</h2>
      <button className="new-game-button" onClick={handleNewGame}>
        + New Game
      </button>

      {loading && <p>Loading games...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Open Games</h3>
      {openGames.length > 0 ? (
        <div className="game-list">
          {openGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onClick={() => handleJoin(game._id)}
              showJoin
            />
          ))}
        </div>
      ) : (
        <p>No open games available</p>
      )}

      <h3>My Open Games</h3>
      <div className="game-list">
        {myOpenGames.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            onClick={() => navigate(`/game/${game._id}`)}
          />
        ))}
      </div>

      <h3>My Active Games</h3>
      <div className="game-list">
        {myActiveGames.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            onClick={() => navigate(`/game/${game._id}`)}
          />
        ))}
      </div>

      <h3>My Completed Games</h3>
      <div className="game-list">
        {myCompletedGames.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            onClick={() => navigate(`/game/${game._id}`)}
            showWinner
          />
        ))}
      </div>

      <h3>Other Games</h3>
      <div className="game-list">
        {otherGames.map((game) => (
          <GameCard
            key={game._id}
            game={game}
            onClick={() => navigate(`/game/${game._id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default AllGames;
