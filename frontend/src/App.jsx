import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Game from "./pages/Game";
import Rules from "./pages/Rules";
import HighScores from "./pages/HighScores";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AllGames from "./pages/AllGames";
import ShipPlacement from "./pages/ShipPlacement";
import { GameProvider } from "./context/GameContext";
import { UserProvider } from "./context/UserContext";
import "./styles/App.css";

function App() {
  return (
    <UserProvider>
      <GameProvider>
        <Router>
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<AllGames />} />
              <Route path="/game/:gameId" element={<Game />} />
              <Route path="/game/:gameId/place" element={<ShipPlacement />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/scores" element={<HighScores />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </GameProvider>
    </UserProvider>
  );
}

export default App;
