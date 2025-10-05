import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBoard from "../components/GameBoard";
import { getGame } from "../api"; 
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaArrowLeft } from "react-icons/fa"; 
import "../css/Replay.css";

export default function Replay() {
  const { gameId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState([]);
  const [moves, setMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [size, setSize] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);  

  const initBoard = useCallback(
    () => Array.from({ length: size }, () => Array(size).fill(null)),
    [size]
  );

  useEffect(() => {
    if (!gameId) return;
    const fetchGame = async () => {
      const game = await getGame(gameId);
      setSize(game.size);
      setMoves(game.moves || []);
      setCurrentMoveIndex(0);
    };
    fetchGame();
  }, [gameId]);

  const updateBoardForMove = useCallback(
    (index) => {
      const newBoard = initBoard();
      moves.slice(0, index + 1).forEach((m) => {
        newBoard[m.rowpos][m.colpos] = m.player;
      });
      setBoard(newBoard);
      setCurrentMoveIndex(index);
    },
    [moves, initBoard]
  );

  useEffect(() => {
    if (moves.length > 0) updateBoardForMove(currentMoveIndex);
  }, [currentMoveIndex, moves, updateBoardForMove]);

  const nextMove = () => {
    if (currentMoveIndex < moves.length - 1) setCurrentMoveIndex(currentMoveIndex + 1);
  };

  const prevMove = () => {
    if (currentMoveIndex > 0) setCurrentMoveIndex(currentMoveIndex - 1);
  };

  useEffect(() => {
    let interval = null;
    if (isPlaying && currentMoveIndex < moves.length - 1) {
      interval = setInterval(() => {
        setCurrentMoveIndex((prev) => {
          if (prev < moves.length - 1) return prev + 1;
          setIsPlaying(false); 
          return prev;
        });
      }, 1200); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMoveIndex, moves.length]);

  const handleBackAll = () => {
    navigate("/allgames"); 
  };

  return (
    <div className="replay-container-main">
      <h2 className="replay-title">Replay Game ID: {gameId}</h2>

      <div className="replay-content">
        <div className="replay-board-section">
          <GameBoard board={board} onCellClick={() => {}} />
        </div>

        <div className="replay-controls-section">
          <div className="replay-buttons-row">
            <button
              className="replay-button"
              onClick={prevMove}
              disabled={currentMoveIndex === 0}
            >
              <FaStepBackward />
            </button>

            <button
              className="replay-button"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              className="replay-button"
              onClick={nextMove}
              disabled={currentMoveIndex === moves.length - 1}
            >
              <FaStepForward />
            </button>
          </div>

          <button className="replay-button back-home" onClick={handleBackAll}>
            <FaArrowLeft /> Back
          </button>

          <table className="replay-moves-table">
            <thead>
              <tr>
                <th>Turn</th>
                <th>Player</th>
                <th>Row</th>
                <th>Col</th>
                <th>Go</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m, index) => (
                <tr
                  key={index}
                  className={
                    index === currentMoveIndex
                      ? "replay-move-highlight"
                      : index % 2 === 0
                      ? "replay-move-even"
                      : "replay-move-odd"
                  }
                >
                  <td>{index + 1}</td>
                  <td>{m.player}</td>
                  <td>{m.rowpos + 1}</td>
                  <td>{m.colpos + 1}</td>
                  <td>
                    <button
                      className="replay-button small"
                      onClick={() => updateBoardForMove(index)}
                    >
                      <FaPlay />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
