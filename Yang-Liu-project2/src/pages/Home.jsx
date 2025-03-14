import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GameContext from "../context/GameContext"; 
import "../styles/Home.css";

const Home = () => {
    const navigate = useNavigate();
    const { setMode } = useContext(GameContext); 
     const handleNormalModeClick = () => {
        console.log("Normal Mode button clicked");
        setMode("normal");  
        navigate("/game");  
    };

    const handleEasyModeClick = () => {
        console.log("Easy Mode button clicked");
        setMode("easy");  
        navigate("/game"); 
    };

    return (
        <div className="main-container">
            <main className="main-content">
                <h1>Welcome to Battleship</h1>
                <p>Prepare your fleet and sink your opponent's ships!</p>
                <div className="buttons">
                    <button 
                        className="start-button" 
                        onClick={handleNormalModeClick}>
                        Play Normal Mode
                    </button>

                    <button 
                        className="start-button easy" 
                        onClick={handleEasyModeClick}>
                        Play Free Mode
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Home;