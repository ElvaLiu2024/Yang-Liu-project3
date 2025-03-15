import React from "react";
import "../styles/Board.css";
import Cell from "./Cell";
const Board = ({ title, grid, onCellClick, onDrop, onDragOver, isEnemyBoard, revealedCells }) => {
    return (
        <div className="board">
            <h2>{title}</h2>
            <div className="grid">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <Cell
                            key={`${rowIndex}-${colIndex}`}
                            status={grid[rowIndex][colIndex]} 
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            onClick={() => onCellClick(rowIndex, colIndex)}
                            onDrop={(event) => onDrop(event, rowIndex, colIndex)}
                            onDragOver={onDragOver} 
                            isEnemyBoard={isEnemyBoard}
                            revealedCells={revealedCells} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};



export default Board;
