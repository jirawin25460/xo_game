package com.example.controller;

import com.example.model.Game;
import com.example.model.Move;
import com.example.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    @Autowired
    private GameService gameService;

    @PostMapping("/create")
    public Game createGame(@RequestParam int size,
                           @RequestParam String playerX,
                           @RequestParam String playerO,
                           @RequestParam(defaultValue = "false") boolean botX,
                           @RequestParam(defaultValue = "false") boolean botO,
                           @RequestParam(defaultValue = "0") int scoreX,
                           @RequestParam(defaultValue = "0") int scoreO) {
        return gameService.createGame(size, playerX, playerO, botX, botO, scoreX, scoreO);
    }

    // เปลี่ยนจาก Move เป็น Game
    @PostMapping("/{gameId}/move")
    public Game makeMove(@PathVariable Long gameId,
                         @RequestParam int rowpos,
                         @RequestParam int colpos,
                         @RequestParam String player) {
        return gameService.makeMove(gameId, player, rowpos, colpos);
    }

    @GetMapping("/{gameId}/moves")
    public List<Move> getMoves(@PathVariable Long gameId) {
        return gameService.getGameMoves(gameId);
    }

    @GetMapping("/{gameId}")
    public Game getGame(@PathVariable Long gameId) {
        return gameService.getGame(gameId);
    }

    @GetMapping
    public List<Game> getAllGames() {
        return gameService.getAllGames();
    }
}
