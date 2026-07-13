package com.oep.online_examination_portal.repository;

import com.oep.online_examination_portal.entity.Quiz;
import com.oep.online_examination_portal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedBy(User user);
}
