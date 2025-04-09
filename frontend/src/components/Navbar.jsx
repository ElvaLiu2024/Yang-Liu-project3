import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const navClass = ({ isActive }) => (isActive ? "active" : "");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    navigate("/");
  };

  const handleNewGame = async () => {
    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("/api/games/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: user.username }),
      });

      if (res.ok) {
        const game = await res.json();
        navigate(`/game/${game._id}`);
      } else {
        alert("Failed to create game.");
      }
    } catch (err) {
      console.error("Error creating new game:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">BattleShip</div>
      <ul className="navbar-links">
        <li>
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/rules" className={navClass}>
            Rules
          </NavLink>
        </li>
        <li>
          <NavLink to="/scores" className={navClass}>
            High Scores
          </NavLink>
        </li>
        <li>
          <NavLink to="/games" className={navClass}>
            All Games
          </NavLink>
        </li>
        <li>
          <span className="nav-action-link" onClick={handleNewGame}>
            New Game
          </span>
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
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={navClass}>
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
