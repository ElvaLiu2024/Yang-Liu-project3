import React from "react";
import "../styles/Cell.css";

const Cell = ({ rowIndex, colIndex, status, onClick, onDrop, onDragOver }) => {
    return (
        <div
            className={`cell ${status}`}
            onClick={() => onClick(rowIndex, colIndex)}
            onDrop={(e) => onDrop(e, rowIndex, colIndex)} 
            onDragOver={(e) => onDragOver(e)} 
         
        >
            {status === "hit" ? "✔" : status === "miss" ? "X" : ""}
            
        </div>
    );
};

export default Cell;

