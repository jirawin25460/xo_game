// Play.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameBoard from "../components/GameBoard";
import { makeMove, getGame, createGame } from "../api";
import "../css/Play.css";

export default function Play() {
  const { gameId: paramGameId, size: paramSize } = useParams();
  const boardSize = Number(paramSize) || 3;
  const navigate = useNavigate();

  const [board, setBoard] = useState([]);
  const [player, setPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [gameStatus, setGameStatus] = useState("ONGOING");
  const [botPlayer, setBotPlayer] = useState(null);
  const [currentGameId, setCurrentGameId] = useState(paramGameId);
  const [lastGameInfo, setLastGameInfo] = useState(null);
  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);

  // สร้าง board ว่าง
  const initBoard = useCallback(
    () => Array.from({ length: boardSize }, () => Array(boardSize).fill(null)),
    [boardSize]
  );

  // อัพเดต board จากข้อมูลเกม
  const updateBoard = useCallback(
    (game) => {
      const newBoard = initBoard();
      let lastPlayer = null;

      (game.moves || []).forEach((m) => {
        newBoard[m.rowpos][m.colpos] = m.player;
        lastPlayer = m.player;
      });

      setBoard(newBoard);
      setWinner(game.winner);
      setGameStatus(game.status || "ONGOING");

      // กำหนดผู้เล่นต่อไป
      setPlayer(
        !game.winner && (!game.moves || game.moves.length === 0)
          ? "X"
          : lastPlayer === "X"
          ? "O"
          : "X"
      );

      // กำหนด bot player
      setBotPlayer(
        game.botO && game.playerO === "Bot"
          ? "O"
          : game.botX && game.playerX === "Bot"
          ? "X"
          : null
      );

      setLastGameInfo({
        size: game.size,
        playerX: game.playerX,
        playerO: game.playerO,
        botX: game.botX,
        botO: game.botO,
      });

      setScoreX(game.scoreX ?? 0);
      setScoreO(game.scoreO ?? 0);
    },
    [initBoard]
  );

  const fetchGame = useCallback(async () => {
    if (!currentGameId) return;
    const game = await getGame(currentGameId);
    updateBoard(game);
  }, [currentGameId, updateBoard]);

  // Bot ทำ move อัตโนมัติ
  const handleBotMove = useCallback(async () => {
    if (!botPlayer || gameStatus === "FINISHED" || player !== botPlayer) return;

    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (!board[i][j]) {
          try {
            await makeMove(currentGameId, i, j, botPlayer);
            const game = await getGame(currentGameId);
            updateBoard(game);
          } catch (err) {
            console.error(err);
          }
          return;
        }
      }
    }
  }, [botPlayer, board, currentGameId, gameStatus, player, boardSize, updateBoard]);

  const handleCellClick = async (row, col) => {
    if (!currentGameId || winner || gameStatus === "FINISHED" || board[row][col]) return;

    try {
      await makeMove(currentGameId, row, col, player);
      const game = await getGame(currentGameId);
      updateBoard(game);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleBotMove();
  }, [board, player, botPlayer, gameStatus, handleBotMove]);

  // โหลดเกมหรือสร้างเกมใหม่
  useEffect(() => {
    const loadGame = async () => {
      if (!currentGameId) {
        // สร้างเกมใหม่ถ้าไม่มี currentGameId
        const game = await createGame(boardSize, "Player X", "Player O", false, false, 0, 0);
        setCurrentGameId(game.gameId);
        navigate(`/play/${game.gameId}/${boardSize}`);
      } else {
        fetchGame();
      }
    };
    setBoard(initBoard());
    loadGame();
  }, [currentGameId, fetchGame, initBoard, navigate, boardSize]);

  const handlePlayAgain = async () => {
    if (!lastGameInfo) return;

    try {
      const game = await createGame(
        lastGameInfo.size,
        lastGameInfo.playerX,
        lastGameInfo.playerO,
        lastGameInfo.botX,
        lastGameInfo.botO,
        scoreX,
        scoreO
      );

      setCurrentGameId(game.gameId);
      setWinner(null);
      setGameStatus("ONGOING");
      setPlayer("X");
      setBoard(initBoard());

      setBotPlayer(
        lastGameInfo.botO && lastGameInfo.playerO === "Bot"
          ? "O"
          : lastGameInfo.botX && lastGameInfo.playerX === "Bot"
          ? "X"
          : null
      );

      navigate(`/play/${game.gameId}/${lastGameInfo.size}`);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเริ่มเกมใหม่ได้");
    }
  };

  const handleBackHome = () => navigate("/");

  return (
    <div className="play-container">
      <h2 className="play-title">Playing Game</h2>

      <div className="play-score">
        <span>Score X: {scoreX}</span> | <span>Score O: {scoreO}</span>
      </div>

      <div className="play-board-container">
        <GameBoard board={board} onCellClick={handleCellClick} />
      </div>

      {gameStatus === "FINISHED" ? (
        <div className="play-buttons-container">
          <h3 className="play-status">Winner: {winner || "Draw"} 🎉</h3>
          <button className="play-button play-again" onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className="play-button back-home" onClick={handleBackHome}>
            Back to Home
          </button>
        </div>
      ) : (
        <h3 className="play-status">Next Player: {player}</h3>
      )}
    </div>
  );
}
