import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import "../styles/HighScores.css";

const HighScores = () => {
  const { user } = useContext(UserContext);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch("/api/scores");
        const data = await res.json();
        setScores(data);
      } catch (err) {
        console.error("Failed to fetch scores", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, []);

  const sortedScores = [...scores].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="scores-page">
      <h2>Score board</h2>
      {loading ? (
        <p>Loading scores...</p>
      ) : (
        <table className="score-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Wins</th>
              <th>Losses</th>
            </tr>
          </thead>
          <tbody>
            {sortedScores.map((player) => (
              <tr
                key={player.username}
                className={
                  user?.username === player.username ? "highlight" : ""
                }
              >
                <td>{player.username}</td>
                <td>{player.wins}</td>
                <td>{player.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HighScores;
