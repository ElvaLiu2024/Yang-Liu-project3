import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/ShipPlacement.css";

const ShipPlacement = () => {
  const { gameId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [grid, setGrid] = useState(
    Array(10)
      .fill()
      .map(() => Array(10).fill(null))
  );
  const [placedCount, setPlacedCount] = useState(0);
  const maxShips = 5;

  const toggleCell = (row, col) => {
    const newGrid = grid.map((r) => r.slice());
    if (newGrid[row][col] === "S") {
      newGrid[row][col] = null;
      setPlacedCount(placedCount - 1);
    } else {
      if (placedCount >= maxShips)
        return alert(`You can place up to ${maxShips} ships.`);
      newGrid[row][col] = "S";
      setPlacedCount(placedCount + 1);
    }
    setGrid(newGrid);
  };

  const handleSubmit = async () => {
    const res = await fetch(`/api/games/${gameId}/place`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username: user.username, grid }),
    });
    if (res.ok) {
      navigate(`/game/${gameId}`);
    } else {
      alert("Failed to place ships.");
    }
  };

  return (
    <div className="ship-placement-page">
      <h2>
        Place Your Ships ({placedCount}/{maxShips})
      </h2>
      <div className="grid">
        {grid.map((row, rIdx) => (
          <div className="row" key={rIdx}>
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`cell ${cell === "S" ? "ship" : ""}`}
                onClick={() => toggleCell(rIdx, cIdx)}
              />
            ))}
          </div>
        ))}
      </div>
      <button
        className="place-button"
        onClick={handleSubmit}
        disabled={placedCount !== maxShips}
      >
        Ready
      </button>
    </div>
  );
};

export default ShipPlacement;
