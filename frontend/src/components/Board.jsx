import React from "react";
import Timer from "./Timer";

const Board = ({
  title,
  grid,
  onCellClick,
  isOwnBoard,
  timeLeft,
  onTimeUp,
}) => {
  if (!grid || grid.length === 0) {
    return <div>No grid data available</div>;
  }

  const getCellClass = (cell, isOwnBoard) => {
    if (cell === "X") return "cell hit";
    if (cell === "O") return "cell miss";
    if (cell === "S" && isOwnBoard) return "cell ship";
    return "cell";
  };

  const getCellContent = (cell) => {
    if (cell === "X") return "✅";
    if (cell === "O") return "❌";
    return "";
  };

  return (
    <div className="board">
      <h2>{title}</h2>
      <div className="grid">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(cell, isOwnBoard)}
              onClick={() => {
                if (cell === "X" || cell === "O") return;
                onCellClick(rowIndex, colIndex);
              }}
            >
              {getCellContent(cell)}
            </div>
          ))
        )}
      </div>

      {/* {typeof timeLeft === "number" && timeLeft !== null ? (
        <p className="time-left">Time Left: {timeLeft}s</p>
      ) : (
        <p className="time-left">Time Left: --</p>
      )} */}
    </div>
  );
};
export default Board;