import React from "react";
import "../styles/Cell.css";

const Cell = ({ rowIndex, colIndex, status, onClick, isEnemyBoard, revealedCells = [], onDrop, onDragOver }) => {
    const isRevealed = revealedCells.includes(`${rowIndex}-${colIndex}`);

    return (
        <div
            className={`cell ${isEnemyBoard && !isRevealed ? "hidden" : status}`} 
            onClick={() => isEnemyBoard && onClick(rowIndex, colIndex)} 
            onDrop={(e) => !isEnemyBoard && onDrop(e, rowIndex, colIndex)}  
            onDragOver={(e) => !isEnemyBoard && onDragOver(e)}  
        >

            {isEnemyBoard && isRevealed ? (
                status === "hit" ? "✅" : status === "miss" ? "X" : null
            ) : null}

        
            {!isEnemyBoard ? (
                status === "hit" ? "✅" :
                status === "miss" ? "X" :
                status === "ship" ? "" : null
            ) : null}
        </div>
    );
};

export default Cell;
