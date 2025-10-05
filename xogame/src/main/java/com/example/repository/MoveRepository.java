package com.example.repository;

import com.example.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MoveRepository extends JpaRepository<Move, Long> {
    List<Move> findByGameGameIdOrderByMoveIdAsc(Long gameId);
}
