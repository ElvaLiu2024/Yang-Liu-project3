import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Rules.css";

const Rules = () => {
    return (
        <div className="rules-container">
            <Navbar />
            <main className="rules-content">
                <h1>Rules of the Game</h1>

                <section className="rules-section">
                    <h2>Basic Gameplay</h2>
                    <ol className="rules-list">
                        <li>The game is played on a 10x10 grid. Players take turns guessing the location of the opponent's ships.</li>
                        <li>If a player guesses correctly, it is marked as a "hit"; otherwise, it is a "miss".</li>
                        <li>The first player to sink all of their opponent's ships wins.</li>
                        <li>Each player must position their ships strategically on their grid to maximize their chances of winning.</li>
                        <li>Ships can't overlap, and the grid should be reset before each game.</li>
                    </ol>
                </section>

                <section className="mode-section">
                    <h2>Game Modes</h2>
                    <p>Players can choose between two game modes:</p>
                    <ul className="mode-list">
                        <li><strong>Normal Mode:</strong> You play against an AI. The AI will also take turns attacking your board.</li>
                        <li><strong>Free Play Mode:</strong> You can freely attack the opponent's board, but the AI will not attack you back.</li>
                    </ul>
                </section>

                <div className="connection">
                    <p> Made by : Example</p>
                    <p>Contact: <a href="mailto:your-email@example.com">example@example.com</a></p> 
                    <p>GitHub: <a href="https://github.com/your-github" target="_blank" rel="noopener noreferrer">github.com/example</a></p>
                    <p>LinkedIn: <a href="https://linkedin.com/in/your-linkedin" target="_blank" rel="noopener noreferrer">linkedin.com/in/example</a></p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Rules;
