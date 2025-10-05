// Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGame } from "../api";
import "../css/Home.css";

export default function Home() {
  const [size, setSize] = useState(3);
  const navigate = useNavigate();

  const startGame = async (withBot = false) => {
    try {
      let playerX = "PlayerX";
      let playerO = "PlayerO";
      let botX = false;
      let botO = false;

      if (withBot) {
        playerO = "Bot";
        botO = true;

        // สุ่มให้บอทเริ่มก่อน 50/50
        const botStarts = Math.random() < 0.5;
        if (botStarts) {
          [playerX, playerO] = [playerO, playerX];
          [botX, botO] = [botO, botX];
        }
      }

      const game = await createGame(size, playerX, playerO, botX, botO);
      navigate(`/play/${game.gameId}/${size}`);
    } catch (error) {
      console.error("Failed to create game:", error);
      alert("ไม่สามารถสร้างเกมได้");
    }
  };

  const handleAllGames = () => {
    navigate("/allgames");
  };

  const handleSizeChange = (e) => {
    let val = Number(e.target.value);
    if (val < 3) val = 3;
    if (val > 19) val = 19;
    setSize(val);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Tic-Tac-Toe Game</h1>

      <div className="home-input-group">
        <label>
          Board Size:
          <input
            type="number"
            value={size}
            onChange={handleSizeChange}
            className="home-input-board-size"
            min={3}
            max={19}
          />
        </label>
      </div>

      <div className="home-buttons-container">
        <button className="home-button vs-player" onClick={() => startGame(false)}>
          Start Game (vs Player)
        </button>

        <button className="home-button vs-bot" onClick={() => startGame(true)}>
          Start Game (vs Bot)
        </button>

        <button className="home-button view-replays" onClick={handleAllGames}>
          View All Replays
        </button>
      </div>
    </div>
  );
}
