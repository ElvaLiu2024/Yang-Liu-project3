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

  const handleShipPlacement = (shipData) => {
    console.log("Placing ship:", shipData);
    navigate(`/game/${gameId}`);
  };

  if (loading) return <p>Loading game...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="ship-placement-container">
      <h2>Place Your Ships</h2>
      {/* Add your ship placement logic here */}
      <p>Player: {user.username}</p>

      <button onClick={() => handleShipPlacement("SampleShipData")}>
        Confirm Ship Placement
      </button>
    </div>
  );
};

export default ShipPlacement;
