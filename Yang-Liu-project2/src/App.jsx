import React from "react";
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Rules from "./pages/Rules";
import HighScores from "./pages/HighScores";
import Footer from "./components/Footer";
import { GameProvider } from "./context/GameContext";
import "./styles/App.css";


function App() {

     return (
        <GameProvider> 
          <Router>
            <Navbar />
            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/rules" element={<Rules />} />
                    <Route path="/scores" element={<HighScores />} />
                </Routes>
            </div>
            <Footer />
            </Router>
        </GameProvider>
    );
}

export default App ;
