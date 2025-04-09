import React, { useEffect, useState } from "react";
import Timer from "./Timer";

const Board = ({ title, grid, onCellClick, isEnemyBoard, timeLeft }) => {
  console.log("Rendering grid:", grid);

  if (!grid || grid.length === 0) {
    return <div>No grid data available</div>;
  }

  return (
    <div className="board">
      <h2>{title}</h2>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cell"
              onClick={() => onCellClick(rowIndex, colIndex)}
              style={{
                backgroundColor: cell === 1 ? "blue" : "lightgray",
              }}
            ></div>
          ))
        )}
      </div>
      <Timer initialTime={timeLeft} onTimeUp={() => alert("Time's up!")} />
    </div>
  );
};

export default Board;
