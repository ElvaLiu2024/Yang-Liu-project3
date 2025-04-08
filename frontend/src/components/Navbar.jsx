import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">BattleShip</div>
      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/game"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Game
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/rules"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Rules
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/scores"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            High Scores
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/games"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            All Games
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/game/new"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            New Game
          </NavLink>
        </li>
        {user ? (
          <>
            <li>
              <span className="welcome-text">Welcome, {user.username}</span>
            </li>
            <li>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </header>
  );
};

export default Navbar;
