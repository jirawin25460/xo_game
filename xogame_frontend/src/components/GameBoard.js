import React from "react";
import "./GameBoard.css";

export default function GameBoard({ board, onCellClick }) {
  const size = board.length;
  const cellSize = Math.min(60, 300 / size);

  return (
    <div className="gb-game-board">
      {board.map((row, i) => (
        <div key={i} className="gb-board-row">
          {row.map((cell, j) => (
            <div
              key={j}
              className={`gb-board-cell ${cell ? "gb-filled" : ""}`}
              style={{ width: cellSize, height: cellSize, fontSize: cellSize / 2 }}
              onClick={() => onCellClick(i, j)}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
