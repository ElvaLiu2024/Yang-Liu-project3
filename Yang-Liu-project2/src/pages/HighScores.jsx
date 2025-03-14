import React, { useEffect, useState } from "react";
import { getHighScores } from "../utils/localStorage"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/HighScores.css";

const HighScores = () => {
    const [scores, setScores] = useState([]);

    useEffect(() => {
    const scores = getHighScores().sort((a, b) => a - b);
    setScores(scores);
}, []);

    return (
        <>
            <Navbar />  
            <div className="high-scores-container">
                <h2>🏆 High Scores</h2>
                <ol>
                    {scores.length === 0 ? (
                        <p>No high scores yet!</p>
                    ) : (
                        scores.map((score, index) => (
                            <li key={index}>{index + 1}. {score} seconds</li>
                        ))
                    )}
                </ol>
            </div>
            <Footer />  
        </>
    );
};

export default HighScores;
