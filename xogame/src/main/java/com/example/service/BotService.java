package com.example.service;

import com.example.model.Game;
import com.example.model.Move;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class BotService {

    private final Random random = new Random();

    public int[] getBotMove(Game game, String botPlayer) {
        if ("FINISHED".equals(game.getStatus())) return null;

        List<Move> moves = game.getMoves();
        if (moves == null) moves = new ArrayList<>();

        if (moves.size() < 2) return firstSmartMove(game, botPlayer);

        return minimaxMove(game, botPlayer, 3);
    }

    private int[] firstSmartMove(Game game, String botPlayer) {
        int n = game.getSize();
        String[][] board = new String[n][n];

        List<Move> moves = game.getMoves();
        if (moves != null) {
            for (Move m : moves) board[m.getRowpos()][m.getColpos()] = m.getPlayer();
        }

        List<int[]> preferred = new ArrayList<>();
        int mid = n / 2;
        if (board[mid][mid] == null) preferred.add(new int[]{mid, mid});

        int[][] corners = {{0,0},{0,n-1},{n-1,0},{n-1,n-1}};
        for (int[] c : corners) if (board[c[0]][c[1]] == null) preferred.add(c);

        List<int[]> freeCells = new ArrayList<>();
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (board[i][j] == null) freeCells.add(new int[]{i, j});

        if (!preferred.isEmpty()) return preferred.get(random.nextInt(preferred.size()));
        if (!freeCells.isEmpty()) return freeCells.get(random.nextInt(freeCells.size()));
        return null;
    }

    private int[] minimaxMove(Game game, String botPlayer, int depthLimit) {
        int n = game.getSize();
        String[][] board = new String[n][n];

        List<Move> moves = game.getMoves();
        if (moves != null) {
            for (Move m : moves) board[m.getRowpos()][m.getColpos()] = m.getPlayer();
        }

        String opponent = botPlayer.equals("X") ? "O" : "X";
        int winLength = n >= 5 ? 5 : n;

        int[] bestMove = null;
        int bestScore = Integer.MIN_VALUE;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (board[i][j] == null) {
                    board[i][j] = botPlayer;
                    int score = minimax(board, depthLimit - 1, false, botPlayer, opponent, winLength, Integer.MIN_VALUE, Integer.MAX_VALUE);
                    board[i][j] = null;
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = new int[]{i, j};
                    }
                }
            }
        }

        if (bestMove == null) return firstSmartMove(game, botPlayer);
        return bestMove;
    }

    private int minimax(String[][] board, int depth, boolean isMax, String botPlayer, String opponent, int winLength, int alpha, int beta) {
        String winner = checkWinnerFull(board, botPlayer, opponent, winLength);
        if (winner != null) {
            if (winner.equals(botPlayer)) return 10 + depth;
            if (winner.equals(opponent)) return -10 - depth;
            return 0;
        }
        if (depth == 0) return evaluateBoard(board, botPlayer, opponent, winLength);

        int n = board.length;
        if (isMax) {
            int maxEval = Integer.MIN_VALUE;
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (board[i][j] == null) {
                        board[i][j] = botPlayer;
                        int eval = minimax(board, depth - 1, false, botPlayer, opponent, winLength, alpha, beta);
                        board[i][j] = null;
                        maxEval = Math.max(maxEval, eval);
                        alpha = Math.max(alpha, eval);
                        if (beta <= alpha) return maxEval;
                    }
            return maxEval;
        } else {
            int minEval = Integer.MAX_VALUE;
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++)
                    if (board[i][j] == null) {
                        board[i][j] = opponent;
                        int eval = minimax(board, depth - 1, true, botPlayer, opponent, winLength, alpha, beta);
                        board[i][j] = null;
                        minEval = Math.min(minEval, eval);
                        beta = Math.min(beta, eval);
                        if (beta <= alpha) return minEval;
                    }
            return minEval;
        }
    }

    private int evaluateBoard(String[][] board, String botPlayer, String opponent, int winLength) {
        return countSequences(board, botPlayer, winLength) - countSequences(board, opponent, winLength);
    }

    private int countSequences(String[][] board, String player, int winLength) {
        int n = board.length;
        int score = 0;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                score += evaluateFromCell(board, i, j, player, winLength);
        return score;
    }

    private int evaluateFromCell(String[][] board, int row, int col, String player, int winLength) {
        if (board[row][col] != null && !board[row][col].equals(player)) return 0;
        int n = board.length;
        int score = 0;

        int count = 0;
        for (int k = 0; k < winLength && col + k < n; k++) if (player.equals(board[row][col + k])) count++;
        score += count;

        count = 0;
        for (int k = 0; k < winLength && row + k < n; k++) if (player.equals(board[row + k][col])) count++;
        score += count;

        count = 0;
        for (int k = 0; k < winLength && row + k < n && col + k < n; k++) if (player.equals(board[row + k][col + k])) count++;
        score += count;

        count = 0;
        for (int k = 0; k < winLength && row + k < n && col - k >= 0; k++) if (player.equals(board[row + k][col - k])) count++;
        score += count;

        return score;
    }

    private String checkWinnerFull(String[][] board, String botPlayer, String opponent, int winLength) {
        int n = board.length;
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (board[i][j] != null && checkWinFromCell(board, i, j, board[i][j], winLength))
                    return board[i][j];
        return null;
    }

    private boolean checkWinFromCell(String[][] board, int row, int col, String player, int winLength) {
        int n = board.length;

        if (col + winLength <= n) {
            boolean win = true;
            for (int k = 0; k < winLength; k++) if (!player.equals(board[row][col + k])) win = false;
            if (win) return true;
        }

        if (row + winLength <= n) {
            boolean win = true;
            for (int k = 0; k < winLength; k++) if (!player.equals(board[row + k][col])) win = false;
            if (win) return true;
        }

        if (row + winLength <= n && col + winLength <= n) {
            boolean win = true;
            for (int k = 0; k < winLength; k++) if (!player.equals(board[row + k][col + k])) win = false;
            if (win) return true;
        }

        if (row + winLength <= n && col - winLength + 1 >= 0) {
            boolean win = true;
            for (int k = 0; k < winLength; k++) if (!player.equals(board[row + k][col - k])) win = false;
            if (win) return true;
        }

        return false;
    }
}
