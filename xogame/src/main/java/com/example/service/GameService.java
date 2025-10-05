package com.example.service;

import com.example.model.Game;
import com.example.model.Move;
import com.example.repository.GameRepository;
import com.example.repository.MoveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService {

    @Autowired private GameRepository gameRepository;
    @Autowired private MoveRepository moveRepository;
    @Autowired private BotService botService;

    public Game createGame(int size, String playerX, String playerO, boolean botX, boolean botO, int scoreX, int scoreO) {
        Game game = new Game();
        game.setSize(size);
        game.setPlayerX(playerX);
        game.setPlayerO(playerO);
        game.setBotX(botX);
        game.setBotO(botO);
        game.setScoreX(scoreX);
        game.setScoreO(scoreO);
        game.setStatus("ONGOING");
        game.setWinner(null);

        Game saved = gameRepository.save(game);

        // สุ่มผู้เริ่มต้น (true = X เริ่ม, false = O เริ่ม)
        boolean xStarts = Math.random() < 0.5;

        // ถ้า Bot เริ่มก่อน
        if ((xStarts && saved.isBotX()) || (!xStarts && saved.isBotO())) {
            String botPlayer = xStarts ? "X" : "O";
            int[] move = botService.getBotMove(saved, botPlayer);
            if (move != null) makeMoveInternal(saved, botPlayer, move[0], move[1]);
        }

        return getGame(saved.getGameId());
    }

    public Game makeMove(Long gameId, String player, int rowpos, int colpos) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        // ถ้าเกมจบแล้ว ให้ return game ปัจจุบันเลย
        if ("FINISHED".equals(game.getStatus())) return getGame(gameId);

        // ผู้เล่นทำ move
        makeMoveInternal(game, player, rowpos, colpos);

        // Bot move ถ้ามีและเกมยังไม่จบ
        if (!"FINISHED".equals(game.getStatus())) {
            if ("X".equals(player) && game.isBotO()) {
                int[] botMove = botService.getBotMove(game, "O");
                if (botMove != null) makeMoveInternal(game, "O", botMove[0], botMove[1]);
            } else if ("O".equals(player) && game.isBotX()) {
                int[] botMove = botService.getBotMove(game, "X");
                if (botMove != null) makeMoveInternal(game, "X", botMove[0], botMove[1]);
            }
        }

        return getGame(gameId);
    }

    private Move makeMoveInternal(Game game, String player, int rowpos, int colpos) {
        Move move = new Move();
        move.setGame(game);
        move.setPlayer(player);
        move.setRowpos(rowpos);
        move.setColpos(colpos);
        moveRepository.save(move);

        checkWinner(game.getGameId());
        return move;
    }

    private void checkWinner(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        int n = game.getSize();
        String[][] board = new String[n][n];

        List<Move> moves = moveRepository.findByGameGameIdOrderByMoveIdAsc(gameId);
        for (Move m : moves) board[m.getRowpos()][m.getColpos()] = m.getPlayer();

        String winner = null;
        int winLength = n >= 5 ? 5 : n;

        // ตรวจแถว
        for (int i = 0; i < n; i++)
            for (int j = 0; j <= n - winLength; j++) {
                String first = board[i][j];
                if (first == null) continue;
                boolean win = true;
                for (int k = 1; k < winLength; k++) if (!first.equals(board[i][j + k])) win = false;
                if (win) winner = first;
            }

        // ตรวจคอลัมน์
        for (int j = 0; j < n; j++)
            for (int i = 0; i <= n - winLength; i++) {
                String first = board[i][j];
                if (first == null) continue;
                boolean win = true;
                for (int k = 1; k < winLength; k++) if (!first.equals(board[i + k][j])) win = false;
                if (win) winner = first;
            }

        // ตรวจแนวทแยงหลัก (\)
        for (int i = 0; i <= n - winLength; i++)
            for (int j = 0; j <= n - winLength; j++) {
                String first = board[i][j];
                if (first == null) continue;
                boolean win = true;
                for (int k = 1; k < winLength; k++) if (!first.equals(board[i + k][j + k])) win = false;
                if (win) winner = first;
            }

        // ตรวจแนวทแยงรอง (/)
        for (int i = 0; i <= n - winLength; i++)
            for (int j = winLength - 1; j < n; j++) {
                String first = board[i][j];
                if (first == null) continue;
                boolean win = true;
                for (int k = 1; k < winLength; k++) if (!first.equals(board[i + k][j - k])) win = false;
                if (win) winner = first;
            }

        // อัพเดตสถานะและคะแนน
        if (winner != null) {
            game.setWinner(winner);
            game.setStatus("FINISHED");
            if ("X".equals(winner)) game.setScoreX(game.getScoreX() + 1);
            else if ("O".equals(winner)) game.setScoreO(game.getScoreO() + 1);
        } else if (moves.size() == n * n) {
            game.setWinner("Draw");
            game.setStatus("FINISHED");
        }

        gameRepository.save(game);
    }

    public Game getGame(Long gameId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
        List<Move> moves = moveRepository.findByGameGameIdOrderByMoveIdAsc(gameId);
        game.setMoves(moves);
        return game;
    }

    public List<Move> getGameMoves(Long gameId) {
        return moveRepository.findByGameGameIdOrderByMoveIdAsc(gameId);
    }

    public List<Game> getAllGames() {
        return gameRepository.findAllByOrderByGameIdDesc();
    }
}
