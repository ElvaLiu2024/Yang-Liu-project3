import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
    const location = useLocation();

    return (
        <header className="navbar">
            <div className="navbar-logo">BattleShip</div>
            <ul className="navbar-links">
                <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Home</Link></li>
                <li><Link to="/game" className={location.pathname === "/game" ? "active" : ""}>Game</Link></li>
                <li><Link to="/rules" className={location.pathname === "/rules" ? "active" : ""}>Rules</Link></li>
                <li><Link to="/scores" className={location.pathname === "/scores" ? "active" : ""}>High Scores</Link></li>
            </ul>

        </header>
    );
};

export default Navbar;