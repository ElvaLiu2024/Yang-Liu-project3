import React from "react";

const Board = ({ title, grid, onCellClick, isOwnBoard }) => {
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
    </div>
  );
};
export default Board;
