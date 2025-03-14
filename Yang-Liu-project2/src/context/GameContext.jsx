import React, { createContext, useState } from "react";
import { createGridWithShips } from "../utils/gameLogic";

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [mode, setMode] = useState("normal");
    const [timer, setTimer] = useState(0);    
    const [gameOver, setGameOver] = useState(false);
    const [enemyGrid, setEnemyGrid] = useState(createGridWithShips()); 
    const [playerGrid, setPlayerGrid] = useState(createGridWithShips()); 

    const toggleModeAndReset = () => {
        setMode(prevMode => (prevMode === "normal" ? "easy" : "normal"));
        restartGame();
    };

    const restartGame = () => {
       setGameOver(false);
       setTimer(0);
       
       setTimeout(() => {
           setEnemyGrid(createGridWithShips());
           setPlayerGrid(createGridWithShips());
       }, );
    };

    return (
       <GameContext.Provider value={{ 
            mode, setMode, toggleModeAndReset, timer, setTimer, 
            gameOver, setGameOver, restartGame, 
            enemyGrid, setEnemyGrid, playerGrid, setPlayerGrid 
        }}>
            {children}
        </GameContext.Provider>
    );
};

export default GameContext;