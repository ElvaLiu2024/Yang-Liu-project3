import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/ShipPlacement.css";

const ShipPlacement = () => {
  const { gameId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grid, setGrid] = useState(
    Array(10)
      .fill()
      .map(() => Array(10).fill(null))
  );
  const [direction, setDirection] = useState("horizontal");
  const [shipsToPlace, setShipsToPlace] = useState([
    { id: "battleship", name: "Battleship", size: 4, placed: false },
    { id: "cruiser", name: "Cruiser", size: 3, placed: false },
    { id: "submarine", name: "Submarine", size: 3, placed: false },
    { id: "destroyer", name: "Destroyer", size: 2, placed: false },
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

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

    fetchGame();
  }, [gameId, user, navigate]);

  const getShipCoords = (row, col, size) => {
    const coords = [];
    for (let i = 0; i < size; i++) {
      const r = direction === "horizontal" ? row : row + i;
      const c = direction === "horizontal" ? col + i : col;
      if (r >= 10 || c >= 10) return null;
      coords.push([r, c]);
    }
    return coords;
  };

  const handleDrop = (e, row, col) => {
    const shipId = e.dataTransfer.getData("shipId");
    const ship = shipsToPlace.find((s) => s.id === shipId);
    if (!ship || ship.placed) return;

    const coords = getShipCoords(row, col, ship.size);
    if (!coords) return;

    const newGrid = grid.map((r) => [...r]);
    for (const [r, c] of coords) {
      if (newGrid[r][c] === "S") return;
    }

    coords.forEach(([r, c]) => (newGrid[r][c] = "S"));
    setGrid(newGrid);

    setShipsToPlace((prev) =>
      prev.map((s) => (s.id === shipId ? { ...s, placed: true } : s))
    );
  };

  const handleConfirmPlacement = async () => {
    const res = await fetch(`/api/games/${gameId}/place`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user.username,
        grid: grid.map((row) => row.map((cell) => (cell === "S" ? "S" : null))),
      }),
    });
    const data = await res.json();
    console.log("Place response data:", data);
    if (res.ok) {
      navigate(`/game/${gameId}`);
    } else {
      alert("Failed to place ships.");
    }
  };

  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;

  const allShipsPlaced = shipsToPlace.every((s) => s.placed);
  const shipsLeft = shipsToPlace.filter((s) => !s.placed).length;

  return (
    <div className="ship-placement-page">
      <div className="controls">
        <button
          className={direction === "horizontal" ? "active" : ""}
          onClick={() => setDirection("horizontal")}
        >
          Horizontal
        </button>
        <button
          className={direction === "vertical" ? "active" : ""}
          onClick={() => setDirection("vertical")}
        >
          Vertical
        </button>
      </div>

      <div className="grid-container">
        <div className="sidebar">
          {shipsToPlace.map((ship) => (
            <div
              key={ship.id}
              className="ship-icon"
              draggable={!ship.placed}
              onDragStart={(e) => e.dataTransfer.setData("shipId", ship.id)}
            >
              {ship.name} ({ship.size})
            </div>
          ))}
          <p className="ships-left">Ships Left: {shipsLeft}</p>
        </div>

        <div className="grid">
          {grid.map((row, rowIndex) => (
            <div className="row" key={rowIndex}>
              {row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`cell ${cell === "S" ? "ship" : ""}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {allShipsPlaced && (
        <button className="place-button" onClick={handleConfirmPlacement}>
          Confirm Placement
        </button>
      )}
    </div>
  );
};

export default ShipPlacement;
