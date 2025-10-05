package com.example.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Getter;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gameId;

    private int size;
    private String playerX;
    private String playerO;
    private String winner;
    private String status = "ONGOING";

    private boolean botX;
    private boolean botO;

    private int scoreX = 0;
    private int scoreO = 0;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Move> moves = new ArrayList<>(); // <-- initialize เป็น empty list
}
