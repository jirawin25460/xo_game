package com.example.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Move {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long moveId;

    private int rowpos;

    private int colpos;

    private String player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    @JsonBackReference
    private Game game;
}
