import React, { useContext, useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Board from "../components/Board";
import Timer from "../components/Timer";
import GameOver from "../components/GameOver";
import ResetButton from "../components/ResetButton";
import GameContext from "../context/GameContext";
import { saveHighScore } from "../utils/localStorage"; 
import { aiAttackPlayer, createEmptyGrid, checkIfGameOver } from "../utils/gameLogic"; 
import "../styles/Game.css";
import Ship from "../components/Ship";

const Game = () => {
    const { mode, toggleModeAndReset, gameOver, setGameOver } = useContext(GameContext);
    
    const loadGameState = () => {
        const savedState = JSON.parse(localStorage.getItem("gameState"));
        if (savedState) {
            return savedState;
        }
        return {
            enemyGrid: createEmptyGrid(),
            playerGrid: createEmptyGrid(),
            orientation: "horizontal",
            gameStarted: false,
            timer: 0,
            ships: { "5x1": 1, "4x1": 1, "3x1": 2, "2x1": 1 },
        };
    };

    const [enemyGrid, setEnemyGrid] = useState(loadGameState().enemyGrid);
    const [playerGrid, setPlayerGrid] = useState(loadGameState().playerGrid);
    const [orientation, setOrientation] = useState(loadGameState().orientation);
    const [gameStarted, setGameStarted] = useState(loadGameState().gameStarted);
    const [timer, setTimer] = useState(loadGameState().timer);
    const [ships, setShips] = useState(loadGameState().ships);
    const [revealedCells, setRevealedCells] = useState([]); 

    useEffect(() => {
        const gameState = { enemyGrid, playerGrid, orientation, gameStarted, timer, ships };
        localStorage.setItem("gameState", JSON.stringify(gameState));
    }, [enemyGrid, playerGrid, orientation, gameStarted, timer, ships]);

    const isValidPlacement = (row, col, shipLength, orientation, grid) => {
        if (orientation === "horizontal" && col + shipLength > 10) return false;
        if (orientation === "vertical" && row + shipLength > 10) return false;

        for (let i = 0; i < shipLength; i++) {
            if (orientation === "horizontal" && grid[row][col + i] !== "empty") return false;
            if (orientation === "vertical" && grid[row + i][col] !== "empty") return false;
        }
        return true;
    };

    const allShipsPlaced = () => {
        return Object.values(ships).every(count => count === 0);
    };

  const handleEnemyClick = (row, col) => {
    if (!gameStarted || gameOver || revealedCells.includes(`${row}-${col}`)) return; 

    setRevealedCells(prev => [...prev, `${row}-${col}`]); 

    setEnemyGrid(prevGrid => {
        const newGrid = prevGrid.map(innerRow => [...innerRow]);

        if (newGrid[row][col] === "ship") {
            newGrid[row][col] = "hit";  
        } else if (newGrid[row][col] === "empty") {
            newGrid[row][col] = "miss"; 
        }

        if (checkIfGameOver(newGrid)) {
            setGameOver(true);
            saveHighScore(timer);
            localStorage.removeItem("gameState");
        }

        return newGrid;
    });

    if (mode === "normal" && !gameOver) {
        setTimeout(() => {
            setPlayerGrid(prevGrid => aiAttackPlayer(prevGrid));
        }, 100);
    }
};


    const handleDragStart = (e, length) => {
        e.dataTransfer.setData("length", length);
        e.dataTransfer.setData("orientation", orientation);
    };

    const handleDrop = (e, row, col) => {
        e.preventDefault();
        const shipLength = parseInt(e.dataTransfer.getData("length"), 10);
        const shipOrientation = e.dataTransfer.getData("orientation");

        const newGrid = [...playerGrid];

        if (isValidPlacement(row, col, shipLength, shipOrientation, newGrid)) {
            for (let i = 0; i < shipLength; i++) {
                if (shipOrientation === "horizontal") newGrid[row][col + i] = "ship";
                else newGrid[row + i][col] = "ship";
            }

            setPlayerGrid(newGrid);

            setShips(prevShips => {
                const updatedShips = { ...prevShips };
                if (updatedShips[`${shipLength}x1`] > 0) {
                    updatedShips[`${shipLength}x1`] -= 1;
                }
                return updatedShips;  
            });
        }
    };

    const toggleOrientation = () => {
        setOrientation(prev => (prev === "horizontal" ? "vertical" : "horizontal"));
    };

    const initializeEnemyShips = useCallback(() => {
        let tempGrid = createEmptyGrid();
        const shipSizes = [5, 4, 3, 3, 2]; 
        shipSizes.forEach(shipLength => {
            placeRandomShip(tempGrid, shipLength);
        });
        setEnemyGrid(tempGrid);
    }, []);

    const resetGame = () => {
    if (gameOver) {
        saveHighScore(timer); 
    }
    localStorage.removeItem("gameState"); 

    setEnemyGrid(createEmptyGrid()); 
    setPlayerGrid(createEmptyGrid()); 
    setRevealedCells([]); 
    setShips({ "5x1": 1, "4x1": 1, "3x1": 2, "2x1": 1 }); 
    setGameStarted(false);
    setGameOver(false);
    setTimer(0);

    setTimeout(() => {
        initializeEnemyShips(); 
    }, 100);
};


    const placeRandomShip = (grid, shipLength) => {
    const directions = ["horizontal", "vertical"];
    let placed = false;

    while (!placed) {
        const randomRow = Math.floor(Math.random() * 10);
        const randomCol = Math.floor(Math.random() * 10);
        const direction = directions[Math.floor(Math.random() * 2)];

        if (isValidPlacement(randomRow, randomCol, shipLength, direction, grid)) {
            for (let i = 0; i < shipLength; i++) {
                if (direction === "horizontal") {
                    grid[randomRow][randomCol + i] = "ship";
                } else {
                    grid[randomRow + i][randomCol] = "ship";
                }
            }
            placed = true;
        }
    }
};

    useEffect(() => {
        initializeEnemyShips();
    }, [initializeEnemyShips]);

    return (
        <div className="game-container">
            <Navbar />
            <main className="game-content">
                <h1>
                    You have entered  
                    <span className={`mode-indicator ${mode}-mode`}>
                        {mode === "normal" ? "Normal Mode" : "Free Mode"}
                    </span>
                </h1>

                {mode === "normal" && <Timer gameStarted={gameStarted} gameOver={gameOver} onTimeUpdate={setTimer} />}

                {gameOver && <GameOver winner={checkIfGameOver(playerGrid) ? "AI" : "Player"} />}

                <div className="ship-container">
                    {Object.entries(ships).map(([size, count]) => (
                        count > 0 && <Ship key={size} length={parseInt(size)} onDragStart={e => handleDragStart(e, parseInt(size))} />
                    ))}
                </div>

                <div className="game-board">
                   
<Board 
    title="Enemy Board" 
    grid={enemyGrid} 
    onCellClick={handleEnemyClick} 
    isEnemyBoard={true} 
    revealedCells={revealedCells} 
/>
<Board 
    title="Player Board" 
    grid={playerGrid} 
    onDrop={handleDrop} 
    onDragOver={(e) => e.preventDefault()} 
    isEnemyBoard={false} 
/>


                </div>

                <div className="game-buttons">
                    <button  className="change-mode-button" onClick={toggleModeAndReset}>
                        Switch to {mode === "normal" ? "Easy Mode" : "Normal Mode"}
                    </button>
                    <button className="toggle-orientation-button"  onClick={toggleOrientation}>
                        Change to {orientation === "horizontal" ? "Vertical" : "Horizontal"}
                    </button>
                </div>

                {!gameStarted ? (
                    <button onClick={() => setGameStarted(allShipsPlaced())} disabled={!allShipsPlaced()} className="start-game-button">
                        Start Game
                    </button>
                ) : (
                    <ResetButton resetGame={resetGame} />
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Game;
