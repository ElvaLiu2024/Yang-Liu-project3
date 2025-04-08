import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/AllGames.css";

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
        const res = await fetch("http://localhost:5001/api/games");
        if (!res.ok)
          throw new Error("Failed to fetch games: " + res.statusText);
        const data = await res.json();
        setGames(data);
      } catch (err) {
        setError("Failed to load games: " + err.message);
        alert("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  const handleJoin = async (gameId) => {
    if (!user) {
      alert("Please login first. ");
      return;
    }
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: user.username }),
    });
    if (res.ok) {
      navigate(`/game/${gameId}`);
    } else {
      alert("Failed to join game.");
    }
  };

  const handleNewGame = async () => {
    console.log("Current user:", user);
    if (!user) return alert("Please login first");
    const res = await fetch("http://localhost:5001/api/games/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: user.username }),
    });

    console.log("Request to create new game:", res);
    if (res.ok) {
      const game = await res.json();
      navigate(`/game/${game._id}`);
    } else {
      alert("Failed to create game.");
    }
  };

  // Filter games based on their status
  const openGames = games.filter(
    (game) =>
      game.status === "open" &&
      !game.players.find((p) => p.username === user?.username)
  );
  const myOpenGames = games.filter(
    (game) =>
      game.status === "open" && game.players[0].username === user?.username
  );
  const myActiveGames = games.filter(
    (game) =>
      game.status === "active" &&
      game.players.some((p) => p.username === user?.username)
  );
  const myCompletedGames = games.filter(
    (game) =>
      game.status === "completed" &&
      game.players.some((p) => p.username === user?.username)
  );
  const otherGames = games
    .filter((game) => game.status === "active" || game.status === "completed")
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
      {openGames.map((game) => (
        <div className="game-card" key={game._id}>
          <p>Status: {game.status}</p>
          <p>Players: {game.players.map((p) => p.username).join(" vs ")}</p>
          <button onClick={() => handleJoin(game._id)}>Join Game</button>
        </div>
      ))}

      <h3>My Open Games</h3>
      {myOpenGames.map((game) => (
        <div className="game-card" key={game._id}>
          <p>Status: {game.status}</p>
          <p>Players: {game.players.map((p) => p.username).join(" vs ")}</p>
          <button onClick={() => navigate(`/game/${game._id}`)}>
            View Game
          </button>
        </div>
      ))}

      <h3>My Active Games</h3>
      {myActiveGames.map((game) => (
        <div className="game-card" key={game._id}>
          <p>Status: {game.status}</p>
          <p>Players: {game.players.map((p) => p.username).join(" vs ")}</p>
          <button onClick={() => navigate(`/game/${game._id}`)}>
            View Game
          </button>
        </div>
      ))}

      <h3>My Completed Games</h3>
      {myCompletedGames.map((game) => (
        <div className="game-card" key={game._id}>
          <p>Status: {game.status}</p>
          <p>Players: {game.players.map((p) => p.username).join(" vs ")}</p>
          <p>Winner: {game.winner?.username}</p>
          <button onClick={() => navigate(`/game/${game._id}`)}>
            View Game
          </button>
        </div>
      ))}

      <h3>Other Games</h3>
      {otherGames.map((game) => (
        <div className="game-card" key={game._id}>
          <p>Status: {game.status}</p>
          <p>Players: {game.players.map((p) => p.username).join(" vs ")}</p>
          <button onClick={() => navigate(`/game/${game._id}`)}>
            View Game
          </button>
        </div>
      ))}
    </div>
  );
};

export default AllGames;
