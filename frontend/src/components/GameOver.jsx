import React from 'react';
import "../styles/GameOver.css";

const GameOver = ({ winner }) => {
  return (
    <div className="game-over-container">
      <h2 className="game-over-message">Game Over!</h2>
      <p className="winner-message">{winner} Wins!</p>
    </div>
  );
};

export default GameOver;     