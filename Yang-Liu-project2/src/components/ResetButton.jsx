import React from "react";
import "../styles/ResetButton.css";

const ResetButton = ({ resetGame }) => {
    return (
        <button onClick={resetGame} className="reset-button">
            Restart Game
        </button>
    );
};

export default ResetButton;