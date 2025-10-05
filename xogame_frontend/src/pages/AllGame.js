import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllGames } from "../api";
import "../css/AllGame.css";

export default function AllGame() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getAllGames();
        setGames(data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      }
    };
    fetchGames();
  }, []);

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="allgames-container">
      <h2 className="allgames-title">All Games</h2>

      <button className="allgames-back-home-button" onClick={handleBackHome}>
        Back to Home
      </button>

      {games.length === 0 ? (
        <p className="allgames-no-games">No games found.</p>
      ) : (
        <table className="allgames-table">
          <thead>
            <tr>
              <th>Game ID</th>
              <th>Size</th>
              <th>Winner</th>
              <th>Replay</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr
                key={game.gameId}
                className={index % 2 === 0 ? "allgames-even" : "allgames-odd"}
              >
                <td>{game.gameId}</td>
                <td>{game.size}</td>
                <td>{game.winner || "-"}</td>
                <td>
                  <Link
                    className="allgames-replay-link"
                    to={`/replay/${game.gameId}`}
                  >
                    Replay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
